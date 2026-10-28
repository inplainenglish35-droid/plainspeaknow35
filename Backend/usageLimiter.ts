import * as admin from "firebase-admin";
import { db } from "./firebaseAdmin";
import { clear } from "console";

/* ============================================================
   TYPES
============================================================ */

export type PaymentSource = "sponsored" | "personal";

export type KeyCheckResult =
  | {
      ok: true;
      source: PaymentSource;
      remaining: number;
      organizationId?: string;
      sponsorshipId?: string;
    }
  | {
      ok: false;
      code:
  | "USER_NOT_FOUND"
  | "INSUFFICIENT_KEYS"
  | "ORGANIZATION_OUT_OF_KEYS";
    };

/* ============================================================
   CHECK AVAILABLE KEYS
   Sponsored Keys First → Personal Keys Second

   CHECK ONLY — NO DEDUCTION

   Use BEFORE calling OpenAI.
============================================================ */

export async function checkAvailableKeys(
  uid: string,
  requiredKeys: number
): Promise<KeyCheckResult> {
  /*
   * First look for active sponsored access belonging to this user.
   */
  const sponsorshipSnapshot = await db
    .collection("sponsorships")
    .where("userId", "==", uid)
    .where("status", "==", "active")
    .get();

  for (const sponsorshipDoc of sponsorshipSnapshot.docs) {
    const sponsorship = sponsorshipDoc.data();

    const sponsorshipRemaining = sponsorship.remainingKeys ?? 0;
    const organizationId = sponsorship.organizationId;

    if (
      organizationId &&
      sponsorshipRemaining >= requiredKeys
    ) {
      const organizationRef = db
        .collection("organizations")
        .doc(organizationId);

      const organizationSnap = await organizationRef.get();

      if (organizationSnap.exists) {
  const organization = organizationSnap.data() || {};
  const organizationBalance = organization.keyBalance ?? 0;
  const organizationStatus = organization.status ?? "active";

  if (organizationStatus === "active") {
    if (organizationBalance < requiredKeys) {
      return {
        ok: false,
        code: "ORGANIZATION_OUT_OF_KEYS",
      };
    }

    return {
      ok: true,
      source: "sponsored",
      remaining: sponsorshipRemaining - requiredKeys,
      organizationId,
      sponsorshipId: sponsorshipDoc.id,
    };
}
      }
    }
  }

  /*
   * No usable sponsorship was found.
   * Fall back to the user's personal Keys.
   */
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return {
      ok: false,
      code: "USER_NOT_FOUND",
    };
  }

  const userData = userSnap.data() || {};
  const personalBalance = userData.keyBalance ?? 0;

  if (personalBalance < requiredKeys) {
    return {
      ok: false,
      code: "INSUFFICIENT_KEYS",
    };
  }

  return {
    ok: true,
    source: "personal",
    remaining: personalBalance - requiredKeys,
  };
}

/* ============================================================
   CONSUME PERSONAL KEYS
   Atomic + Logged

   Use ONLY after successful processing.
============================================================ */

export async function consumePersonalKeys(
  uid: string,
  requiredKeys: number
): Promise<KeyCheckResult> {
  const userRef = db.collection("users").doc(uid);

  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);

    if (!userSnap.exists) {
      return {
        ok: false,
        code: "USER_NOT_FOUND",
      };
    }

    const userData = userSnap.data() || {};
    const currentBalance = userData.keyBalance ?? 0;

    if (currentBalance < requiredKeys) {
      return {
        ok: false,
        code: "INSUFFICIENT_KEYS",
      };
    }

    const newBalance = currentBalance - requiredKeys;

    tx.update(userRef, {
      keyBalance: newBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const transactionRef = db
      .collection("keyTransactions")
      .doc();

    tx.set(transactionRef, {
      uid,
      type: "debit",
      source: "document_processing",
      amount: requiredKeys,
      remainingBalance: newBalance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      source: "personal",
      remaining: newBalance,
    };
  });
}

/* ============================================================
   CONSUME SPONSORED KEYS
   Atomic + Logged

   Both balances are changed in ONE transaction.

   No document name, document content, or result is stored
   for the sponsoring organization.
============================================================ */

export async function consumeSponsoredKeys(
  uid: string,
  requiredKeys: number,
  organizationId: string,
  sponsorshipId: string
): Promise<KeyCheckResult> {
  const organizationRef = db
    .collection("organizations")
    .doc(organizationId);

  const sponsorshipRef = db
    .collection("sponsorships")
    .doc(sponsorshipId);

  return db.runTransaction(async (tx) => {
    const organizationSnap = await tx.get(organizationRef);
    const sponsorshipSnap = await tx.get(sponsorshipRef);

    if (!organizationSnap.exists || !sponsorshipSnap.exists) {
      return {
        ok: false,
        code: "INSUFFICIENT_KEYS",
      };
    }

    const organization = organizationSnap.data() || {};
    const sponsorship = sponsorshipSnap.data() || {};

    /*
     * Verify this sponsorship still belongs to this user
     * and organization.
     */
    if (
      sponsorship.userId !== uid ||
      sponsorship.organizationId !== organizationId ||
      sponsorship.status !== "active" ||
      organization.status !== "active"
    ) {
      return {
        ok: false,
        code: "INSUFFICIENT_KEYS",
      };
    }

    const organizationBalance = organization.keyBalance ?? 0;
    const sponsorshipBalance = sponsorship.remainingKeys ?? 0;

    if (
      organizationBalance < requiredKeys ||
      sponsorshipBalance < requiredKeys
    ) {
      return {
        ok: false,
        code: "INSUFFICIENT_KEYS",
      };
    }

    const newOrganizationBalance =
      organizationBalance - requiredKeys;

    const newSponsorshipBalance =
      sponsorshipBalance - requiredKeys;

    /*
     * Both deductions happen atomically.
     */
    tx.update(organizationRef, {
      keyBalance: newOrganizationBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.update(sponsorshipRef, {
      remainingKeys: newSponsorshipBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    /*
     * Organization receipt book.
     *
     * Deliberately contains NO document information.
     */
    const transactionRef = db
      .collection("organizationKeyTransactions")
      .doc();

    tx.set(transactionRef, {
      organizationId,
      sponsorshipId,
      type: "debit",
      source: "sponsored_document_processing",
      amount: requiredKeys,
      remainingBalance: newOrganizationBalance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      source: "sponsored",
      remaining: newSponsorshipBalance,
      organizationId,
      sponsorshipId,
    };
  });
}








