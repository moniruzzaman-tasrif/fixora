import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("fixora");

export const auth = betterAuth({
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
      },
      area: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        // Public sign-up may only ever create customers or technicians.
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === "technician" ? "technician" : "customer",
          },
        }),
      },
      update: {
        // Role changes go through the protected admin API, never a self-update.
        before: async (user) => {
          if (user.role !== undefined) {
            const { role: _ignored, ...rest } = user;
            return { data: rest };
          }
        },
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
