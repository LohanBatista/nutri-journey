import { ListPatientsUseCase } from "../use-cases/ListPatients";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";

export function makeListPatientsUseCase(): ListPatientsUseCase {
  const patientRepository = new PrismaPatientRepository();
  return new ListPatientsUseCase(patientRepository);
}
