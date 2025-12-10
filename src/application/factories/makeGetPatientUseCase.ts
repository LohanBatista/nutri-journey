import { GetPatientUseCase } from "../use-cases/GetPatient";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";

export function makeGetPatientUseCase(): GetPatientUseCase {
  const patientRepository = new PrismaPatientRepository();
  return new GetPatientUseCase(patientRepository);
}

