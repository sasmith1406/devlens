
import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { url } = req.body;

  // Check that a URL was provided
  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: "Repository URL is required",
    });
  }

  // Parse the URL safely
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid URL",
    });
  }

  // Only accept GitHub repository URLs
  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== "github.com" ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid HTTPS GitHub repository URL",
    });
  }

  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

  if (
    pathParts.length !== 2 ||
    pathParts.some((part) => part === "." || part === "..") ||
    !/^[a-zA-Z0-9_.-]+$/.test(pathParts[0]) ||
    !/^[a-zA-Z0-9_.-]+$/.test(pathParts[1]) ||
    pathParts[0] === "." ||
    pathParts[1] === "." ||
    pathParts[0] === ".." ||
    pathParts[1] === ".."
  ) {
    return res.status(400).json({
      success: false,
      message: "URL must point to a GitHub repository, such as https://github.com/owner/repo",
    });
  }

  const owner = pathParts[0];
  const repository = pathParts[1].replace(/\.git$/i, "");

  if (!repository) {
    return res.status(400).json({
      success: false,
      message: "Repository name is required",
    });
  }

  return res.json({
    success: true,
    message: "Repository URL accepted",
    repository: {
      owner,
      name: repository,
      url: `https://github.com/${owner}/${repository}`,
    },
  });
});

export default router;
