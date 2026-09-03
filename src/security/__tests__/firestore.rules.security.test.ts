/** @jest-environment node */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const PROJECT_ID = "demo-sitefiguraviva";
const hasFirestoreEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const describeWithEmulator = hasFirestoreEmulator ? describe : describe.skip;

describeWithEmulator("firestore security rules (critical abuse cases)", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();

      await setDoc(doc(db, "users/u1"), {
        uid: "u1",
        role: "student",
        isActive: true,
        displayName: "User One",
      });

      await setDoc(doc(db, "enrollments/u1_course-1"), {
        userId: "u1",
        courseId: "course-1",
        status: "active",
      });

      await setDoc(doc(db, "progress/p1"), {
        userId: "u1",
        courseId: "course-1",
        lessonId: "l1",
        status: "completed",
      });
    });
  });

  it("blocks self privilege escalation on users/{uid}", async () => {
    const db = testEnv
      .authenticatedContext("u1", {
        role: "student",
        admin: false,
        isActive: true,
      })
      .firestore();

    await assertFails(
      updateDoc(doc(db, "users/u1"), {
        role: "admin",
        isActive: true,
      }),
    );
  });

  it("allows safe profile update while denying governance fields", async () => {
    const db = testEnv
      .authenticatedContext("u1", {
        role: "student",
        admin: false,
        isActive: true,
      })
      .firestore();

    await assertSucceeds(
      updateDoc(doc(db, "users/u1"), {
        displayName: "Novo Nome",
        bio: "Perfil seguro",
      }),
    );

    await assertFails(
      updateDoc(doc(db, "users/u1"), {
        role: "admin",
      }),
    );
  });

  it("denies client-side writes to progress", async () => {
    const db = testEnv
      .authenticatedContext("u1", {
        role: "student",
        admin: false,
        isActive: true,
      })
      .firestore();

    await assertFails(
      setDoc(doc(db, "progress/forged"), {
        userId: "u1",
        courseId: "course-1",
        lessonId: "l999",
        status: "completed",
      }),
    );

    await assertSucceeds(getDoc(doc(db, "progress/p1")));
  });

  it("denies spoofed assessment submission for another user", async () => {
    const db = testEnv
      .authenticatedContext("u1", {
        role: "student",
        admin: false,
        isActive: true,
      })
      .firestore();

    await assertFails(
      setDoc(doc(db, "assessmentSubmissions/s1"), {
        assessmentId: "a1",
        userId: "u2",
        courseId: "course-1",
        status: "pending",
        answers: [],
      }),
    );
  });

  it("allows own pending submission but blocks client grading fields", async () => {
    const db = testEnv
      .authenticatedContext("u1", {
        role: "student",
        admin: false,
        isActive: true,
      })
      .firestore();

    await assertSucceeds(
      setDoc(doc(db, "assessmentSubmissions/s2"), {
        assessmentId: "a1",
        userId: "u1",
        courseId: "course-1",
        status: "pending",
        answers: [],
        attemptNumber: 1,
      }),
    );

    await assertFails(
      setDoc(doc(db, "assessmentSubmissions/s3"), {
        assessmentId: "a1",
        userId: "u1",
        courseId: "course-1",
        status: "graded",
        answers: [],
        attemptNumber: 1,
        score: 100,
        percentage: 100,
        passed: true,
      }),
    );
  });

  it("denies client-side creation of applications", async () => {
    // Public interest submissions go through /api/applications/submit, which
    // uses the Admin SDK and bypasses rules. Nothing should be able to write
    // here from a client, signed in or not.
    const anonDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      setDoc(doc(anonDb, "applications/spam-1"), {
        name: "Spam",
        courseId: "course-1",
      }),
    );

    const studentDb = testEnv
      .authenticatedContext("u1", {
        role: "student",
        admin: false,
        isActive: true,
      })
      .firestore();

    await assertFails(
      setDoc(doc(studentDb, "applications/spam-2"), {
        name: "Spam",
        courseId: "course-1",
      }),
    );
  });

  it("allows an admin to manage applications", async () => {
    const adminDb = testEnv
      .authenticatedContext("admin-1", {
        role: "admin",
        admin: true,
        isActive: true,
      })
      .firestore();

    await assertSucceeds(
      setDoc(doc(adminDb, "applications/a1"), {
        name: "Aluna",
        courseId: "course-1",
        status: "submitted",
      }),
    );
  });
});
