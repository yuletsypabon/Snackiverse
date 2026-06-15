import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GRADES = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B"];
const TYPES = ["prepaid", "weekly", "monthly", "biweekly"] as const;

const FIRST_NAMES = [
  "Santiago", "Valentina", "Sebastián", "Isabella", "Mateo",
  "Salome", "Samuel", "Luciana", "Tomás", "Mariana",
  "Nicolás", "Gabriela", "Diego", "Sofía", "Andrés",
  "Camila", "Felipe", "Natalia", "Alejandro", "Daniela",
  "Julián", "Paula", "Miguel", "Laura", "David",
];

const LAST_NAMES = [
  "García", "Rodríguez", "Martínez", "López", "González",
  "Pérez", "Sánchez", "Ramírez", "Torres", "Flores",
  "Rivera", "Gómez", "Díaz", "Reyes", "Morales",
  "Cruz", "Ortiz", "Herrera", "Medina", "Castillo",
];

async function main() {
  console.log("Creando 100 estudiantes de prueba...");

  let created = 0;

  for (let i = 0; i < 100; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${firstName} ${lastName} ${i + 1}`; // número para hacerlos únicos
    const grade = GRADES[i % GRADES.length];
    const type = TYPES[i % TYPES.length];
    const balance = type === "prepaid" ? 20000 + (i * 1000) : 0;

    await prisma.student.create({
      data: {
        name,
        grade,
        type,
        balance,
        isActive: true,
      },
    });

    created++;
  }

  console.log(`✓ ${created} estudiantes de prueba creados exitosamente.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
