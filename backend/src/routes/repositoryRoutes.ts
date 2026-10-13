
import { Router } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/repositories
// Retrieve all repositories saved in PostgreSQL
router.get("/", async (_req, res) => {
  try {
    const repositories = await prisma.repository.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      repositories,
    });
  } catch (error) {
    console.error("Failed to fetch repositories:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch repositories.",
    });
  }
});

// POST /api/repositories
// Validate, verify, and save a GitHub repository
router.post("/", async (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: "Repository URL is required.",
    });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid URL.",
    });
  }

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname.toLowerCase() !== "github.com" ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.port
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid HTTPS GitHub repository URL.",
    });
  }

  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

  if (
    pathParts.length !== 2 ||
    pathParts.some((part) => part === "." || part === "..") ||
    !/^[a-zA-Z0-9_.-]+$/.test(pathParts[0]) ||
    !/^[a-zA-Z0-9_.-]+$/.test(pathParts[1])
  ) {
    return res.status(400).json({
      success: false,
      message:
        "URL must point to a GitHub repository, such as https://github.com/owner/repo.",
    });
  }

  const owner = pathParts[0];
  const name = pathParts[1].replace(/\.git$/i, "");

  if (
    !name ||
    name === "." ||
    name === ".." ||
    !/^[a-zA-Z0-9_-]+(?:[a-zA-Z0-9_.-]*[a-zA-Z0-9_-])?$/.test(name)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid repository name.",
    });
  }

  // Ask GitHub whether the repository exists and is accessible.
  let githubResponse: Response;

  try {
    githubResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "DevLens",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch (error) {
    console.error("GitHub API request failed:", error);

    return res.status(503).json({
      success: false,
      message: "Unable to reach GitHub. Please try again.",
    });
  }

  if (githubResponse.status === 404) {
    return res.status(400).json({
      success: false,
      message: "Repository not found or not publicly accessible.",
    });
  }

  if (
    githubResponse.status === 403 ||
    githubResponse.status === 429
  ) {
    return res.status(503).json({
      success: false,
      message: "GitHub rate limit reached or access was restricted. Please try again later.",
    });
  }

  if (!githubResponse.ok) {
    return res.status(502).json({
      success: false,
      message: "GitHub could not verify this repository.",
    });
  }

  const canonicalUrl = `https://github.com/${owner}/${name}`;

  try {
    const repository = await prisma.repository.create({
      data: {
        owner,
        name,
        url: canonicalUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Repository verified and saved successfully.",
      repository,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "This repository has already been added.",
      });
    }

    console.error("Failed to save repository:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save repository. Please try again.",
    });
  }
});

export default router;

