// syncRegionData.ts
import { prismaClient } from "../application/database";
import { RegionService } from "./region-service";

export async function syncRegionData(): Promise<void> {
  console.log("Starting region data synchronization...");

  try {
    // 1. Ambil semua provinsi dari API
    console.log("Fetching provinces from API...");
    const provinces = await RegionService.getProvinces();
    console.log(`Found ${provinces.length} provinces in API`);

    // 2. Hitung provinsi yang belum ada di database
    for (const province of provinces) {
      const existingProvince = await prismaClient.province.findUnique({
        where: { code: province.code },
      });

      if (!existingProvince) {
        // Tambahkan provinsi yang belum ada
        await prismaClient.province.create({
          data: {
            code: province.code,
            name: province.name,
          },
        });
        console.log(`Added province: ${province.name}`);
      } else {
        // Opsional: Update nama jika ada perubahan
        if (existingProvince.name !== province.name) {
          await prismaClient.province.update({
            where: { code: province.code },
            data: { name: province.name },
          });
          console.log(
            `Updated province name: ${existingProvince.name} -> ${province.name}`
          );
        }
      }

      // 3. Ambil data kabupaten/kota untuk setiap provinsi
      console.log(`Fetching regencies for province ${province.name}...`);
      const regencies = await RegionService.getRegency(province.code);
      console.log(
        `Found ${regencies.length} regencies for province ${province.name}`
      );

      for (const regency of regencies) {
        const existingRegency = await prismaClient.regency.findUnique({
          where: { code: regency.code },
        });

        if (!existingRegency) {
          // Tambahkan kabupaten/kota yang belum ada
          await prismaClient.regency.create({
            data: {
              code: regency.code,
              name: regency.name,
              province_code: regency.province_code,
            },
          });
          console.log(`Added regency: ${regency.name}`);
        } else {
          // Opsional: Update nama jika ada perubahan
          if (existingRegency.name !== regency.name) {
            await prismaClient.regency.update({
              where: { code: regency.code },
              data: { name: regency.name },
            });
            console.log(
              `Updated regency name: ${existingRegency.name} -> ${regency.name}`
            );
          }
        }

        // 4. Ambil data kecamatan untuk setiap kabupaten/kota
        console.log(`Fetching districts for regency ${regency.name}...`);
        const districts = await RegionService.getDistrict(regency.code);
        console.log(
          `Found ${districts.length} districts for regency ${regency.name}`
        );

        for (const district of districts) {
          const existingDistrict = await prismaClient.district.findUnique({
            where: { code: district.code },
          });

          if (!existingDistrict) {
            // Tambahkan kecamatan yang belum ada
            await prismaClient.district.create({
              data: {
                code: district.code,
                name: district.name,
                regency_code: district.regency_code,
              },
            });
            console.log(`Added district: ${district.name}`);
          } else {
            // Opsional: Update nama jika ada perubahan
            if (existingDistrict.name !== district.name) {
              await prismaClient.district.update({
                where: { code: district.code },
                data: { name: district.name },
              });
              console.log(
                `Updated district name: ${existingDistrict.name} -> ${district.name}`
              );
            }
          }

          // 5. Ambil data desa untuk setiap kecamatan
          // Menambahkan delay kecil untuk menghindari rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));

          console.log(`Fetching villages for district ${district.name}...`);
          const villages = await RegionService.getVillage(district.code);
          console.log(
            `Found ${villages.length} villages for district ${district.name}`
          );

          for (const village of villages) {
            const existingVillage = await prismaClient.village.findUnique({
              where: { code: village.code },
            });

            if (!existingVillage) {
              // Tambahkan desa yang belum ada
              await prismaClient.village.create({
                data: {
                  code: village.code,
                  name: village.name,
                  district_code: village.district_code,
                },
              });
              console.log(`Added village: ${village.name}`);
            } else {
              // Opsional: Update nama jika ada perubahan
              if (existingVillage.name !== village.name) {
                await prismaClient.village.update({
                  where: { code: village.code },
                  data: { name: village.name },
                });
                console.log(
                  `Updated village name: ${existingVillage.name} -> ${village.name}`
                );
              }
            }
          }
        }
      }
    }

    console.log("Region data synchronization completed successfully!");
  } catch (error) {
    console.error("Error during region data synchronization:", error);
    throw error;
  }
}

// Untuk menjalankan script ini secara terpisah
if (require.main === module) {
  syncRegionData()
    .then(() => {
      console.log("Synchronization complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Synchronization failed:", error);
      process.exit(1);
    });
}
