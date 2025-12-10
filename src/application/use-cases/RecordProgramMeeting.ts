import type {
  ProgramMeetingRecord,
  RecordProgramMeetingInput as DomainRecordProgramMeetingInput,
} from "@/domain/entities/Program";
import type { ProgramMeetingRecordRepository } from "@/domain/repositories/ProgramMeetingRecordRepository";
import type { ProgramMeetingRepository } from "@/domain/repositories/ProgramMeetingRepository";

export interface RecordProgramMeetingInput {
  programMeetingId: string;
  patientId: string;
  presence: boolean;
  weightKg?: number | null;
  bmi?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  notes?: string | null;
}

export interface RecordProgramMeetingOutput {
  record: ProgramMeetingRecord;
}

export class RecordProgramMeetingUseCase {
  constructor(
    private readonly programMeetingRepository: ProgramMeetingRepository,
    private readonly programMeetingRecordRepository: ProgramMeetingRecordRepository
  ) {}

  async execute(
    input: RecordProgramMeetingInput
  ): Promise<RecordProgramMeetingOutput> {
    // Verificar se o encontro existe
    const meeting = await this.programMeetingRepository.findById(
      input.programMeetingId
    );

    if (!meeting) {
      throw new Error("Encontro não encontrado");
    }

    const recordData: DomainRecordProgramMeetingInput = {
      programMeetingId: input.programMeetingId,
      patientId: input.patientId,
      presence: input.presence,
      weightKg: input.weightKg ?? null,
      bmi: input.bmi ?? null,
      bloodPressureSystolic: input.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: input.bloodPressureDiastolic ?? null,
      notes: input.notes ?? null,
    };

    const record =
      await this.programMeetingRecordRepository.createOrUpdate(recordData);

    return { record };
  }
}

