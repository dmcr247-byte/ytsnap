import prisma from "./prisma";

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const settings = await prisma.websiteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  } catch (error) {
    console.error("Error loading website settings:", error);
    return {};
  }
}

export async function getSetting(key: string, defaultValue = ""): Promise<string> {
  try {
    const item = await prisma.websiteSetting.findUnique({
      where: { key },
    });
    return item?.value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function getAdSlots(): Promise<
  Record<string, { htmlContent: string; isActive: boolean }>
> {
  try {
    const ads = await prisma.advertisement.findMany();
    const map: Record<string, { htmlContent: string; isActive: boolean }> = {};
    for (const ad of ads) {
      map[ad.slot] = {
        htmlContent: ad.htmlContent || "",
        isActive: ad.isActive,
      };
    }
    return map;
  } catch (error) {
    console.error("Error loading ad slots:", error);
    return {};
  }
}
