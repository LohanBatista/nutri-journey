import { UpdatePatientUseCase } from "../use-cases/UpdatePatient";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";

export function makeUpdatePatientUseCase(): UpdatePatientUseCase {
  const patientRepository = new PrismaPatientRepository();
  return new UpdatePatientUseCase(patientRepository);
}

