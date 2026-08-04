const PTERODACTYL_URL = process.env.PTERODACTYL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;

interface PterodactylUser {
  id: number;
  uuid: string;
  username: string;
  email: string;
}

export async function createPterodactylUser(email: string, username: string, password: string) {
  if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
    console.log("Pterodactyl not configured");
    return null;
  }

  try {
    const res = await fetch(`${PTERODACTYL_URL}/api/application/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PTERODACTYL_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "Application/vnd.pterodactyl.v1+json",
      },
      body: JSON.stringify({
        email,
        username,
        first_name: username,
        last_name: "",
        password,
      }),
    });

    if (!res.ok) throw new Error("Failed to create Pterodactyl user");

    return await res.json();
  } catch (error) {
    console.error("Pterodactyl user creation failed:", error);
    return null;
  }
}

export async function createServer(userId: number, config: any) {
  if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) return null;

  try {
    const res = await fetch(`${PTERODACTYL_URL}/api/application/servers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PTERODACTYL_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "Application/vnd.pterodactyl.v1+json",
      },
      body: JSON.stringify({
        name: config.serverName,
        user: userId,
        egg: 1, // Default egg (Minecraft)
        docker_image: "ghcr.io/pterodactyl/yolks:java_21",
        startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
        limits: {
          memory: config.ram * 1024,
          swap: 0,
          disk: config.ssd * 1024,
          io: 500,
          cpu: config.cpu * 100,
        },
        feature_limits: {
          databases: 5,
          allocations: 1,
          backups: config.backup ? 7 : 0,
        },
      }),
    });

    return res.ok ? await res.json() : null;
  } catch (error) {
    console.error("Server creation failed:", error);
    return null;
  }
}
