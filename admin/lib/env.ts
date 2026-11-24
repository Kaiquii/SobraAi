import "server-only";

function requiredEnv(name: "API_URL") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`A variável de ambiente ${name} não foi configurada.`);
  }

  return value.replace(/\/$/, "");
}

export const env = {
  apiUrl: requiredEnv("API_URL"),
};
