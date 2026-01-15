// Clinic Data - Doctors and Exams Catalog

export interface DoctorSchedule {
  weekday: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  ranges: [string, string][];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  slotMinutes: number;
  schedule: DoctorSchedule[];
}

export interface Exam {
  name: string;
  price: number;
  synonyms?: string[];
}

export const doctors: Doctor[] = [
  {
    id: "doc_camila",
    name: "Dra. Camila Andrade",
    specialty: "Clínica Geral",
    slotMinutes: 30,
    schedule: [
      { weekday: "MON", ranges: [["08:00", "12:00"], ["14:00", "18:00"]] },
      { weekday: "WED", ranges: [["08:00", "12:00"], ["14:00", "18:00"]] },
      { weekday: "FRI", ranges: [["08:00", "12:00"], ["14:00", "18:00"]] }
    ]
  },
  {
    id: "doc_rafael",
    name: "Dr. Rafael Menezes",
    specialty: "Cardiologia",
    slotMinutes: 30,
    schedule: [
      { weekday: "TUE", ranges: [["09:00", "13:00"]] },
      { weekday: "THU", ranges: [["09:00", "13:00"]] }
    ]
  },
  {
    id: "doc_juliana",
    name: "Dra. Juliana Pires",
    specialty: "Dermatologia",
    slotMinutes: 30,
    schedule: [
      { weekday: "MON", ranges: [["13:00", "18:00"]] },
      { weekday: "TUE", ranges: [["13:00", "18:00"]] },
      { weekday: "THU", ranges: [["13:00", "18:00"]] }
    ]
  },
  {
    id: "doc_bruno",
    name: "Dr. Bruno Saldanha",
    specialty: "Ortopedia",
    slotMinutes: 30,
    schedule: [
      { weekday: "WED", ranges: [["09:00", "12:00"], ["14:00", "17:00"]] },
      { weekday: "FRI", ranges: [["09:00", "12:00"], ["14:00", "17:00"]] }
    ]
  },
  {
    id: "doc_larissa",
    name: "Dra. Larissa Coelho",
    specialty: "Ginecologia/Obstetrícia",
    slotMinutes: 30,
    schedule: [
      { weekday: "MON", ranges: [["08:00", "12:00"]] },
      { weekday: "THU", ranges: [["08:00", "12:00"]] }
    ]
  },
  {
    id: "doc_felipe",
    name: "Dr. Felipe Azevedo",
    specialty: "Pediatria",
    slotMinutes: 30,
    schedule: [
      { weekday: "TUE", ranges: [["08:00", "12:00"], ["14:00", "17:00"]] },
      { weekday: "WED", ranges: [["08:00", "12:00"], ["14:00", "17:00"]] }
    ]
  },
  {
    id: "doc_renata",
    name: "Dra. Renata Paiva",
    specialty: "Endocrinologia",
    slotMinutes: 30,
    schedule: [{ weekday: "FRI", ranges: [["09:00", "13:00"]] }]
  },
  {
    id: "doc_tiago",
    name: "Dr. Tiago Nunes",
    specialty: "Neurologia",
    slotMinutes: 30,
    schedule: [{ weekday: "THU", ranges: [["14:00", "18:00"]] }]
  },
  {
    id: "doc_beatriz",
    name: "Dra. Beatriz Santos",
    specialty: "Psiquiatria",
    slotMinutes: 40,
    schedule: [
      { weekday: "MON", ranges: [["14:00", "18:00"]] },
      { weekday: "WED", ranges: [["14:00", "18:00"]] }
    ]
  },
  {
    id: "doc_gustavo",
    name: "Dr. Gustavo Lima",
    specialty: "Gastroenterologia",
    slotMinutes: 30,
    schedule: [
      { weekday: "TUE", ranges: [["14:00", "18:00"]] },
      { weekday: "FRI", ranges: [["14:00", "18:00"]] }
    ]
  }
];

export const exams: Exam[] = [
  { name: "Hemograma completo", price: 45 },
  { name: "Glicemia em jejum", price: 25 },
  { name: "Hemoglobina glicada (HbA1c)", price: 65 },
  { name: "Colesterol total e frações", price: 60 },
  { name: "Triglicerídeos", price: 35 },
  { name: "TSH", price: 55 },
  { name: "T4 livre", price: 55 },
  { name: "Vitamina D", price: 120 },
  { name: "Vitamina B12", price: 95 },
  { name: "Ferritina", price: 85 },
  { name: "Ferro sérico", price: 55 },
  { name: "Ácido úrico", price: 30 },
  { name: "Creatinina", price: 25 },
  { name: "Ureia", price: 25 },
  { name: "TGO (AST)", price: 30 },
  { name: "TGP (ALT)", price: 30 },
  { name: "Gama GT", price: 35 },
  { name: "Bilirrubinas", price: 35 },
  { name: "PCR (Proteína C reativa)", price: 55 },
  { name: "VHS", price: 30 },
  { name: "Coagulograma", price: 75 },
  { name: "Urina tipo 1 (EAS)", price: 25 },
  { name: "Urocultura", price: 60 },
  { name: "Parasitológico de fezes", price: 40 },
  { name: "Coprocultura", price: 70 },
  { name: "Beta-hCG", price: 45 },
  { name: "PSA total", price: 85 },
  { name: "PSA livre", price: 95 },
  { name: "Testosterona total", price: 85 },
  { name: "Testosterona livre", price: 110 },
  { name: "Estradiol", price: 90 },
  { name: "Progesterona", price: 90 },
  { name: "Prolactina", price: 80 },
  { name: "Insulina", price: 80 },
  { name: "Curva glicêmica", price: 120 },
  { name: "Sorologia HIV", price: 85 },
  { name: "HBsAg (Hepatite B)", price: 75 },
  { name: "Anti-HCV (Hepatite C)", price: 85 },
  { name: "VDRL (Sífilis)", price: 35 },
  { name: "Dengue (NS1/IgM/IgG)", price: 140 },
  { name: "Covid/Influenza (painel rápido)", price: 160 },
  { name: "Eletrocardiograma (ECG)", price: 90, synonyms: ["ECG", "eletro"] },
  { name: "Holter 24h", price: 220 },
  { name: "MAPA 24h", price: 240 },
  { name: "Raio-X tórax", price: 120, synonyms: ["rx torax", "radiografia torax"] },
  { name: "Raio-X coluna lombar", price: 140, synonyms: ["rx lombar"] },
  { name: "Ultrassom abdome total", price: 220, synonyms: ["us abdome", "ultrassonografia abdome"] },
  { name: "Ultrassom tireoide", price: 190, synonyms: ["us tireoide"] },
  { name: "Ultrassom transvaginal", price: 210, synonyms: ["us transvaginal", "ultrassonografia transvaginal"] },
  { name: "Ultrassom obstétrico", price: 240, synonyms: ["us obstetrico", "ultrassonografia obstetrica"] },
  { name: "Doppler carótidas", price: 280 },
  { name: "Ecocardiograma", price: 350, synonyms: ["eco do coração", "ecocardiografia", "eco coração"] },
  { name: "Tomografia crânio (sem contraste)", price: 480, synonyms: ["tc cranio", "tomografia cabeça"] },
  { name: "Ressonância joelho", price: 690, synonyms: ["rm joelho", "ressonancia magnetica joelho"] },
  { name: "Endoscopia digestiva alta", price: 520, synonyms: ["endoscopia", "eda"] }
];

export function findExamByName(query: string): Exam | undefined {
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return exams.find(exam => {
    const normalizedName = exam.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) {
      return true;
    }
    
    if (exam.synonyms) {
      return exam.synonyms.some(syn => {
        const normalizedSyn = syn.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedSyn.includes(normalizedQuery) || normalizedQuery.includes(normalizedSyn);
      });
    }
    
    return false;
  });
}

export function findDoctorsBySpecialty(specialty: string): Doctor[] {
  const normalizedSpecialty = specialty.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return doctors.filter(doctor => {
    const normalizedDoctorSpecialty = doctor.specialty.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedDoctorSpecialty.includes(normalizedSpecialty) || normalizedSpecialty.includes(normalizedDoctorSpecialty);
  });
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}
