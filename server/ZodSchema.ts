import { z } from "zod";

export const postSchema = z.object({
  id: z.number(),
  likes: z.array(z.object({ id: z.string(), name: z.string() })),
  updatedAt: z.coerce.date(),
  createdById: z.string(),
  createdByName: z.string(),
  artform: z.union([
    z.object({
      type: z.literal("Shiba"),
      parameters: z.object({
        fog: z.number(),
      }),
    }),
    // z.object({
    //   type: z.literal("ThreeBody"),
    //   parameters: z.object({
    //     bodies: z.number(),
    //   }),
    // }),
    z.object({
      type: z.literal("Conway"),
      parameters: z.object({
        live: z.array(z.array(z.boolean())),
      }),
    }),
    z.object({
      type: z.literal("Canvas"),
      parameters: z.object({
        users: z
          .array(
            z.object({
              userId: z.string(), // Allow any userId
              lines: z.array(
                z.array(
                  z.object({
                    x: z.number(),
                    y: z.number(),
                    color: z.string(),
                    width: z.number(),
                  })
                )
              ),
            })
          )
          .refine(
            (users) => users.some((user) => user.userId === "DEFAULT_USER"),
            {
              message: "There must be a user with userId DEFAULT_USER",
            }
          ),
      }),
    }),
  ]),
});

export const newPostSchema = z.object({
  artform: postSchema.shape.artform,
});
export const likeSchema = z.object({ postId: z.number() });

// Define a schema for the request headers and body
// export const authRequestSchema = z.object({
//   headers: z.object({
//     authorization: z.string().optional(),
//   }),
//   body: z.object({
//     // Define expected body properties if any
//   }),
// });

// // Define a schema for the response
// export const authResponseSchema = z.object({
//   status: z.number(),
//   json: z
//     .function()
//     .args(
//       z.object({
//         error: z.string().optional(),
//       })
//     )
//     .returns(z.void()),
// });
export type RectangleStoreType = Extract<
  z.infer<typeof postSchema>["artform"],
  { type: "Canvas" }
>["parameters"]["users"][number]["lines"];
