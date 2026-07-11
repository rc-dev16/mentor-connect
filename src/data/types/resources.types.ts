import type { CreateResourceRequest } from "@shared/contracts/resources";

export type { Resource, CreateResourceRequest, CreateResourceResponse } from "@shared/contracts/resources";

/** Frontend FormData payload (file is not part of the JSON wire contract). */
export type CreateResourceInput = CreateResourceRequest & {
  file?: File;
};
