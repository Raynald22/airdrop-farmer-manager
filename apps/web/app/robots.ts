
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/dashboard/",
                "/settings/",
                "/sign-in/",
                "/sign-up/",
            ],
        },
        sitemap: "https://airdrop-farmer.com/sitemap.xml",
    };
}
