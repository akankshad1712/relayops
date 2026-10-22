import { PrismaClient, Role, Severity, IncidentStatus, ServiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password) {
    console.log("SEED_DEMO_PASSWORD is empty; seed skipped to avoid creating a known-password account.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: "akankshadeshmukh651@gmail.com" },
    update: { passwordHash },
    create: { name: "Akanksha Deshmukh", email: "akankshadeshmukh651@gmail.com", passwordHash, role: Role.ADMIN }
  });
  const services = [
    { name: "Payments API", description: "Checkout and transaction processing", team: "Core Payments", status: ServiceStatus.OPERATIONAL, uptime: 99.98 },
    { name: "Identity Gateway", description: "Authentication and session services", team: "Platform", status: ServiceStatus.DEGRADED, uptime: 99.91 },
    { name: "Event Pipeline", description: "Streaming ingestion and delivery", team: "Data Infrastructure", status: ServiceStatus.OPERATIONAL, uptime: 99.96 },
    { name: "Customer Console", description: "Customer-facing application", team: "Experience", status: ServiceStatus.OPERATIONAL, uptime: 99.99 }
  ];
  for (const service of services) {
    await prisma.service.upsert({ where: { name: service.name }, update: service, create: service });
  }
  const allServices = await prisma.service.findMany();
  const incidents = [
    { title: "Elevated checkout latency in EU-West", summary: "Latency rose above the 900 ms threshold after a downstream dependency slowdown.", severity: Severity.SEV2, status: IncidentStatus.MONITORING, serviceId: allServices[0].id, ownerId: user.id },
    { title: "Intermittent token refresh failures", summary: "A subset of refresh requests returned 5xx responses. Mitigation is deployed and being monitored.", severity: Severity.SEV2, status: IncidentStatus.IDENTIFIED, serviceId: allServices[1].id, ownerId: user.id },
    { title: "Delayed event delivery for analytics", summary: "Consumer lag exceeded the normal operating range during a traffic spike.", severity: Severity.SEV3, status: IncidentStatus.RESOLVED, serviceId: allServices[2].id, ownerId: user.id, resolvedAt: new Date() }
  ];
  for (const incident of incidents) {
    const exists = await prisma.incident.findFirst({ where: { title: incident.title } });
    if (!exists) await prisma.incident.create({ data: incident });
  }
  console.log("RelayOps demo data seeded.");
}
main().finally(() => prisma.$disconnect());
