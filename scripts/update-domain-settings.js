const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  await prisma.websiteSetting.upsert({
    where: { key: "sitemap_base_url" },
    update: { value: "https://ytsnap.tech" },
    create: { key: "sitemap_base_url", value: "https://ytsnap.tech", group: "seo" },
  });

  await prisma.websiteSetting.upsert({
    where: { key: "robots_txt_content" },
    update: {
      value: "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /*/admin/\n\nSitemap: https://ytsnap.tech/sitemap.xml",
    },
    create: {
      key: "robots_txt_content",
      value: "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /*/admin/\n\nSitemap: https://ytsnap.tech/sitemap.xml",
      group: "seo",
    },
  });

  await prisma.websiteSetting.upsert({
    where: { key: "site_name" },
    update: { value: "YTSnap" },
    create: { key: "site_name", value: "YTSnap", group: "general" },
  });

  await prisma.websiteSetting.upsert({
    where: { key: "support_email" },
    update: { value: "support@ytsnap.tech" },
    create: { key: "support_email", value: "support@ytsnap.tech", group: "general" },
  });

  console.log("✓ All platform settings successfully configured for https://ytsnap.tech");
  await prisma.$disconnect();
}

run();
