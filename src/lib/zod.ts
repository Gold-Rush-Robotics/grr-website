import { extension } from "mime-types";
import { z as baseZ } from "zod";

type MimeTypeOptions = {
  allowedTopLevelTypes?: string[];
  message?: string;
};

function isMimeType(
  value: string,
  allowedTopLevelTypes?: string[],
) {
  if (!extension(value)) {
    return false;
  }

  if (!allowedTopLevelTypes?.length) {
    return true;
  }

  const [topLevelType] = value.split("/");
  return allowedTopLevelTypes.includes(topLevelType ?? "");
}

function mimeType(options: MimeTypeOptions = {}) {
  const {
    allowedTopLevelTypes,
    message = "Invalid MIME type.",
  } = options;

  return baseZ.string().refine(
    (value) => isMimeType(value, allowedTopLevelTypes),
    { message },
  );
}

export const z = {
  ...baseZ,
  mimeType,
};
