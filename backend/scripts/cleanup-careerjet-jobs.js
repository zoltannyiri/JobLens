const prisma = require("../src/config/prisma");

async function main() {
  const deletedSavedJobs = await prisma.savedJob.deleteMany({
    where: {
      job: {
        source: "careerjet",
      },
    },
  });

  const deletedJobs = await prisma.job.deleteMany({
    where: {
      source: "careerjet",
    },
  });

  console.log(`Törölt mentések: ${deletedSavedJobs.count}`);
  console.log(`Törölt Careerjet állások: ${deletedJobs.count}`);
}

main()
  .catch((error) => {
    console.error("Careerjet takarítási hiba:", error);
  process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  }
)