
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



/* GET /api/repositories/:id/files
   Fetch the file and folder structure of a saved GitHub repository. */
router.get("/:id/files", async (req, res) => {
  const id = Number(req.params.id);

  // Validate the repository ID.
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid repository ID.",
    });
  }

  try {
    // Find the repository saved in PostgreSQL.
    const repository = await prisma.repository.findUnique({
      where: { id },
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found in DevLens.",
      });
    }

    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "DevLens",
    };

    // Get the repository's default branch from GitHub.
    const repoResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`,
      {
        headers,
        signal: AbortSignal.timeout(10000),
      },
    );

    if (repoResponse.status === 404) {
      return res.status(404).json({
        success: false,
        message: "GitHub repository was not found or is not publicly accessible.",
      });
    }

    if (repoResponse.status === 403 || repoResponse.status === 429) {
      return res.status(503).json({
        success: false,
        message: "GitHub rate limit reached or access was restricted.",
      });
    }

    if (!repoResponse.ok) {
      return res.status(502).json({
        success: false,
        message: "Unable to retrieve repository details from GitHub.",
      });
    }

    const repoData = (await repoResponse.json()) as {
      default_branch: string;
    };

    // Fetch the complete file tree for the default branch.
    const treeResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/git/trees/${encodeURIComponent(repoData.default_branch)}?recursive=1`,
      {
        headers,
        signal: AbortSignal.timeout(15000),
      },
    );

    if (treeResponse.status === 403 || treeResponse.status === 429) {
      return res.status(503).json({
        success: false,
        message: "GitHub rate limit reached or access was restricted.",
      });
    }

    if (!treeResponse.ok) {
      return res.status(502).json({
        success: false,
        message: "Unable to retrieve the repository file tree.",
      });
    }

    const treeData = (await treeResponse.json()) as {
      truncated: boolean;
      tree: Array<{
        path: string;
        type: string;
        sha: string;
        size?: number;
      }>;
    };

    return res.json({
      success: true,
      repository: {
        id: repository.id,
        owner: repository.owner,
        name: repository.name,
        defaultBranch: repoData.default_branch,
      },
      truncated: treeData.truncated,
      entries: treeData.tree.map((entry) => ({
        path: entry.path,
        type: entry.type,
        sha: entry.sha,
        ...(entry.size !== undefined ? { size: entry.size } : {}),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch repository file tree:", error);

    return res.status(502).json({
      success: false,
      message: "Unable to connect to GitHub or retrieve the file tree.",
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

