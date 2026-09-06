import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");

dotenv.config({ path: path.join(projectRoot, ".env.local"), quiet: true });
dotenv.config({ path: path.join(projectRoot, ".env"), quiet: true });

const dryRun = process.argv.includes("--dry-run");
const unknownArguments = process.argv
  .slice(2)
  .filter((arg) => arg !== "--dry-run");

if (unknownArguments.length > 0) {
  console.error(`Unsupported arguments: ${unknownArguments.join(", ")}`);
  process.exit(1);
}

const requiredEnvironment = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const missingEnvironment = requiredEnvironment.filter(
  (name) => !process.env[name],
);

if (missingEnvironment.length > 0) {
  console.error(
    `Missing environment variables: ${missingEnvironment.join(", ")}`,
  );
  process.exit(1);
}

const courseCovers = [
  {
    localPath: "public/cursos/superviso-clnica-co-visar/capa.jpeg",
    objectPath: "courses/co-visar/capa.jpeg",
    slug: "co-visar",
    title: "Supervisão Clínica: CO-VISAR",
  },
  {
    localPath:
      "public/cursos/III Formação Clínica em Gestalt-Terapia/capa.jpeg",
    objectPath: "courses/iii-formacao-clinica-em-gestalt-terapia/capa.jpeg",
    slug: "iii-formacao-clinica-em-gestalt-terapia",
    title: "III Formação Clínica em Gestalt-Terapia",
  },
  {
    localPath: "public/cursos/experincia-atemporal/capa.jpeg",
    objectPath: "courses/experiencia-atemporal/capa.jpeg",
    slug: "experiencia-atemporal",
    title: "Experiência Atemporal",
  },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "X-Client-Info": "figura-viva-platform/course-cover-migration",
      },
    },
  },
);

async function resolveCourse({ slug, title }) {
  const bySlug = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (bySlug.error) {
    throw bySlug.error;
  }
  if (bySlug.data) {
    return bySlug.data;
  }

  const byTitle = await supabase
    .from("courses")
    .select("id")
    .eq("title", title)
    .maybeSingle();

  if (byTitle.error) {
    throw byTitle.error;
  }
  if (!byTitle.data) {
    throw new Error(`No course matched slug ${slug} or its exact title.`);
  }

  return byTitle.data;
}

async function uploadCover(cover, course) {
  const body = await readFile(path.join(projectRoot, cover.localPath));
  const storage = supabase.storage.from("course-assets");
  const { error: uploadError } = await storage.upload(cover.objectPath, body, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const publicUrl = storage.getPublicUrl(cover.objectPath).data.publicUrl;
  const { error: updateError } = await supabase
    .from("courses")
    .update({
      cover_image_url: publicUrl,
      image_url: publicUrl,
      thumbnail_url: publicUrl,
    })
    .eq("id", course.id);

  if (updateError) {
    throw updateError;
  }

  return publicUrl;
}

async function main() {
  for (const cover of courseCovers) {
    await access(path.join(projectRoot, cover.localPath));
    const course = await resolveCourse(cover);

    if (dryRun) {
      console.log(
        `[dry-run] ${cover.localPath} -> ${cover.objectPath} | course=${course.id}`,
      );
      continue;
    }

    const publicUrl = await uploadCover(cover, course);
    console.log(
      `[uploaded] ${cover.localPath} -> ${cover.objectPath} | course=${course.id} | ${publicUrl}`,
    );
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[failed] ${message}`);
  process.exitCode = 1;
});
