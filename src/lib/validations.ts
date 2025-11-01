import { z } from 'zod';

export const documentUploadSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200, "Il titolo deve essere meno di 200 caratteri"),
  code: z.string().trim().max(50, "Il codice deve essere meno di 50 caratteri").optional().or(z.literal('')),
  description: z.string().trim().max(2000, "La descrizione deve essere meno di 2000 caratteri").optional().or(z.literal('')),
  author: z.string().trim().max(100, "L'autore deve essere meno di 100 caratteri").optional().or(z.literal('')),
  version: z.string().trim().max(20, "La versione deve essere meno di 20 caratteri").optional().or(z.literal('')),
  category: z.string().min(1, "La categoria è obbligatoria"),
});

export const analyzeComplianceSchema = z.object({
  documentText: z.string()
    .trim()
    .min(10, "Il testo del documento deve contenere almeno 10 caratteri")
    .max(50000, "Il testo del documento deve essere meno di 50000 caratteri"),
  standard: z.string()
    .trim()
    .max(100, "Lo standard deve essere meno di 100 caratteri")
    .optional()
    .or(z.literal('')),
});

export const generateDocumentSchema = z.object({
  documentType: z.string().min(1, "Il tipo di documento è obbligatorio"),
  customType: z.string().trim().max(100, "Il tipo personalizzato deve essere meno di 100 caratteri").optional().or(z.literal('')),
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200, "Il titolo deve essere meno di 200 caratteri"),
  code: z.string().trim().max(50, "Il codice deve essere meno di 50 caratteri").optional().or(z.literal('')),
  standard: z.string().trim().max(100, "Lo standard deve essere meno di 100 caratteri").optional().or(z.literal('')),
  content: z.string()
    .trim()
    .min(10, "Il contenuto deve contenere almeno 10 caratteri")
    .max(50000, "Il contenuto deve essere meno di 50000 caratteri"),
});
