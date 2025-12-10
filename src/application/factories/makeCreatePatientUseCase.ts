import { CreatePatientUseCase } from "../use-cases/CreatePatient";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";

export function makeCreatePatientUseCase(): CreatePatientUseCase {
  const patientRepository = new PrismaPatientRepository();
  return new CreatePatientUseCase(patientRepository);
}
