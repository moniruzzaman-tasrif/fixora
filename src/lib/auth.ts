import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const authBaseUrl = process.env.BETTER_AUTH_URL;
const authOrigin = authBaseUrl ? new URL(authBaseUrl).origin : undefined;

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("fixora");

export const auth = betterAuth({
  baseURL: authBaseUrl,
  user: {
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
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
          crv: "Ed25519",
        },
      },
      jwt: {
        issuer: authOrigin,
        audience: authOrigin,
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
        }),
      },
    }),
  ],
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
            const rest = { ...user };
            delete rest.role;
            return { data: rest };
          }
        },
      },
    },
  },
  socialProviders:
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {},
  database: mongodbAdapter(db, {
    client,
  }),
});
