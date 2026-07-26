const prisma = require("../src/config/prisma");

async function main() {
  const deletedSavedJobs = await prisma.savedJob.deleteMany({
    where: {
      job: {
        is: {
          source: "jooble",
        },
      },
    },
  });

  const deletedJobs = await prisma.job.deleteMany({
    where: {
      source: "jooble",
    },
  });

  console.log(`Törölt mentések: ${deletedSavedJobs.count}`);
  console.log(`Törölt Jooble állások: ${deletedJobs.count}`);
}

main()
  .catch((error) => {
    console.error("Jooble takarítási hiba:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  