
"use strict";

// PDF formatting extractor
// CommonJS module with dynamic import of pdfjs-dist.
//
// This detects formatting drawn as thin filled rectangles.
// It does not yet detect every possible PDF strikethrough or underline.
// Original extracted text is always preserved.

function multiplyMatrices(m1, m2) {
  const [a, b, c, d, e, f] = m1;
  const [g, h, i, j, k, l] = m2;

  return [
    a * g + c * h,
    b * g + d * h,
    a * i + c * j,
    b * i + d * j,
    a * k + c * l + e,
    b * k + d * l + f
  ];
}

function transformPoint(matrix, x, y) {
  const [a, b, c, d, e, f] = matrix;

  return {
    x: a * x + c * y + e,
    y: b * x + d * y + f
  };
}

function rectangleFromPath(args) {
  // This shape was confirmed in the test ballot PDF.
  // Other path types are deliberately not guessed at.
  const coords = args?.[1]?.[0];

  if (!coords || coords.length !== 13) {
    return null;
  }

  const xs = [coords[1], coords[4], coords[7], coords[10]];
  const ys = [coords[2], coords[5], coords[8], coords[11]];

  if (![...xs, ...ys].every(Number.isFinite)) {
    return null;
  }

  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  const width = right - left;
  const height = bottom - top;

  // Candidate geometry in PDF drawing coordinates.
  if (width <= 10 || height <= 0 || height > 2) {
    return null;
  }

  return {
    left,
    right,
    top,
    bottom
  };
}

function collectThinRectangles(pdfjs, operators) {
  let currentMatrix = [1, 0, 0, 1, 0, 0];
  const graphicsStack = [];
  const rectangles = [];

  for (let i = 0; i < operators.fnArray.length; i++) {
    const operation = operators.fnArray[i];
    const args = operators.argsArray[i];

    if (operation === pdfjs.OPS.save) {
      graphicsStack.push([...currentMatrix]);
      continue;
    }

    if (operation === pdfjs.OPS.restore) {
      if (graphicsStack.length > 0) {
        currentMatrix = graphicsStack.pop();
      }
      continue;
    }

    if (operation === pdfjs.OPS.transform) {
      currentMatrix = multiplyMatrices(currentMatrix, args);
      continue;
    }

    if (operation !== pdfjs.OPS.constructPath) {
      continue;
    }

    const path = rectangleFromPath(args);

    if (!path) {
      continue;
    }

    const corners = [
      transformPoint(currentMatrix, path.left, path.top),
      transformPoint(currentMatrix, path.right, path.top),
      transformPoint(currentMatrix, path.left, path.bottom),
      transformPoint(currentMatrix, path.right, path.bottom)
    ];

    const xs = corners.map(point => point.x);
    const ys = corners.map(point => point.y);

    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const width = Math.max(...xs) - x;
    const height = Math.max(...ys) - y;

    // Check the actual transformed dimensions as well.
    if (
      ![x, y, width, height].every(Number.isFinite) ||
      width <= 10 ||
      height <= 0 ||
      height > 2
    ) {
      continue;
    }

    rectangles.push({
      x,
      y,
      width,
      height,
      operationIndex: i
    });
  }

  return rectangles;
}

function classifyFormatting(rectangles, items) {
  const formatting = {
    strikethrough: [],
    underline: [],
    uncertain: []
  };

  for (const rect of rectangles) {
    const lineCenterY = rect.y + rect.height / 2;

    const candidates = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];

      if (
        !item.str?.trim() ||
        !Number.isFinite(item.width) ||
        !Number.isFinite(item.height) ||
        item.width <= 0 ||
        item.height <= 0
      ) {
        continue;
      }

      const x = item.transform?.[4];
      const baseline = item.transform?.[5];

      if (!Number.isFinite(x) || !Number.isFinite(baseline)) {
        continue;
      }

      const overlapStart = Math.max(x, rect.x);
      const overlapEnd = Math.min(
        x + item.width,
        rect.x + rect.width
      );

      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap <= 0) {
        continue;
      }

      const coveragePercent = 100 * overlap / item.width;
      const relativeY = (lineCenterY - baseline) / item.height;

      // Only consider lines vertically near this text.
      if (relativeY < -0.25 || relativeY > 0.75) {
        continue;
      }

      let classification = "uncertain";

      // Confirmed against the crossed-out lines in the
      // California ballot PDF test page.
      if (relativeY >= 0.2 && relativeY <= 0.65) {
        classification = "strikethrough";
      } else if (relativeY >= -0.25 && relativeY < 0.15) {
        classification = "underline";
      }

      candidates.push({
        itemIndex,
        text: item.str,
        classification,
        coveragePercent: Number(coveragePercent.toFixed(1)),
        relativeY: Number(relativeY.toFixed(3)),
        overlapStart: Number(overlapStart.toFixed(2)),
        overlapEnd: Number(overlapEnd.toFixed(2)),
        textStart: Number(x.toFixed(2)),
        textEnd: Number((x + item.width).toFixed(2))
      });
    }

    // Require substantial horizontal coverage for an
    // automatic classification. Partial matches are
    // retained for review, not silently discarded.
    const strongMatches = candidates.filter(
      candidate => candidate.coveragePercent >= 50
    );

    const partialMatches = candidates.filter(
      candidate => candidate.coveragePercent < 50
    );

    for (const match of strongMatches) {
      const result = {
        text: match.text,
        itemIndex: match.itemIndex,
        coveragePercent: match.coveragePercent,
        relativeY: match.relativeY,
        rectangle: {
          x: Number(rect.x.toFixed(2)),
          y: Number(rect.y.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2))
        }
      };

      if (
        match.classification === "strikethrough" &&
        match.coveragePercent < 99.5
      ) {
        // A partially covered text item may contain both
        // deleted and retained words.
        formatting.uncertain.push({
          ...result,
          reason: "Partial strikethrough: word boundaries not verified",
          overlapStart: match.overlapStart,
          overlapEnd: match.overlapEnd,
          textStart: match.textStart,
          textEnd: match.textEnd
        });
      } else {
        formatting[match.classification].push(result);
      }
    }

        for (const match of partialMatches) {
      if (match.classification === "underline") {
        formatting.underline.push({
          text: match.text,
          itemIndex: match.itemIndex,
          coveragePercent: match.coveragePercent,
          relativeY: match.relativeY,
          reason: "Partial underline"
        });
      } else {
        formatting.uncertain.push({
          text: match.text,
          itemIndex: match.itemIndex,
          coveragePercent: match.coveragePercent,
          relativeY: match.relativeY,
          reason: "Less than half of text item overlaps line"
        });
      }
    }

    // Preserve unmatched shapes as uncertain instead
    // of pretending we know what they represent.
    if (candidates.length === 0) {
      formatting.uncertain.push({
        text: null,
        reason: "Thin rectangle has no nearby text match",
        rectangle: {
          x: Number(rect.x.toFixed(2)),
          y: Number(rect.y.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2))
        }
      });
    }
  }

  return formatting;
}

async function extractFormattedPdf(buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true
  }).promise;

  try {
    const pages = [];

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const operators = await page.getOperatorList();

      const rectangles = collectThinRectangles(
        pdfjs,
        operators
      );

      const formatting = classifyFormatting(
        rectangles,
        content.items
      );

      const originalText = content.items
  .map(item => item.str || "")
  .join(" ");

const fullyStruckItems = new Set(
  formatting.strikethrough
    .filter(entry => entry.coveragePercent >= 99.5)
    .map(entry => entry.itemIndex)
);

const uncertainItems = new Set(
  formatting.uncertain
    .filter(entry => Number.isInteger(entry.itemIndex))
    .map(entry => entry.itemIndex)
);

// Never automatically remove text whose formatting is uncertain.
const retainedText = content.items
  .filter((item, index) =>
    !fullyStruckItems.has(index) || uncertainItems.has(index)
  )
  .map(item => item.str || "")
  .join(" ");

const removedText = content.items
  .filter((item, index) =>
    fullyStruckItems.has(index) && !uncertainItems.has(index)
  )
  .map(item => item.str || "")
  .join(" ");

  const textItems = content.items.map((item, index) => {
  const isFullyStruck = fullyStruckItems.has(index);
  const isUncertain = uncertainItems.has(index);

  return {
    itemIndex: index,
    text: item.str || "",
    status: isUncertain
      ? "uncertain"
      : isFullyStruck
        ? "struck"
        : "retained"
  };
});
pages.push({
  pageNumber,
  text: originalText,
  textItems,
  wording: {
  retained: retainedText,
  removed: removedText,
  uncertain: formatting.uncertain.map(entry => ({
    text: entry.text,
    reason: entry.reason
  })),
  requiresReview: formatting.uncertain.length > 0
},
  formatting
});
    }

    return {
      pageCount: pdf.numPages,
      pages
    };
  } finally {
    await pdf.destroy();
  }
}

module.exports = { extractFormattedPdf };
