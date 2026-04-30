import { ResumeTemplate } from './resume.model';
import { ResumeEditorResume, ResumeSection, ResumeTheme } from './resume.model';
import {
  CustomSection,
  CustomSectionItem,
  Education,
  EducationSection,
  Project,
  ProjectsSection,
  ResumeDocument,
  ResumeDocumentSection,
  ResumeThemeConfig,
  ResumeTemplateKey,
  Skill,
  SkillsSection,
  SkillLevel,
  WorkExperience,
  WorkExperienceSection
} from './resume-document.model';

export function createResumeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function templateKeyFromTemplate(template: ResumeTemplate | null | undefined): ResumeTemplateKey {
  const key = template?.templateKey?.toLowerCase() ?? '';
  const style = template?.styleType?.toLowerCase() ?? '';
  const layout = template?.layoutType?.toLowerCase() ?? '';
  const category = template?.category?.toLowerCase() ?? '';
  const role = template?.roleType?.toLowerCase() ?? '';
  const name = template?.name?.toLowerCase() ?? '';
  const signal = [key, style, layout, category, role, name].join(' ');

  if (signal.includes('creative')) {
    return 'creative';
  }
  if (signal.includes('compact') || key.includes('professional-one-page')) {
    return 'compact';
  }
  if (signal.includes('ats') || signal.includes('internship')) {
    return 'ats';
  }
  if (signal.includes('java') || signal.includes('backend') || signal.includes('developer') || signal.includes('analyst')) {
    return layout.includes('two') || key.includes('fullstack') ? 'modern' : 'developer';
  }
  if (signal.includes('mba') || signal.includes('professional')) {
    return 'professional';
  }
  if (key.includes('classic') || style.includes('clean')) {
    return 'classic';
  }
  if (key.includes('minimal') || style.includes('minimal')) {
    return 'minimal';
  }
  if (layout.includes('two')) {
    return 'modern';
  }
  return 'modern';
}

export function createDefaultResumeDocument(
  templateKey: ResumeTemplateKey = 'modern',
  title = 'My Resume'
): ResumeDocument {
  return {
    schemaVersion: 1,
    title,
    templateKey,
    personal: {
      fullName: 'Mason Turner',
      headline: 'Experienced Sales Professional | B2B | Networking',
      email: 'hello@masonturner.com',
      phone: '+1 234 555 1234',
      location: 'Denver, Colorado',
      links: 'linkedin.com/in/masonturner',
      summary: 'Accomplished sales professional with a proven track record in B2B environments, consistently driving growth and building lasting client relationships. Known for increasing sales and improving client retention, eager to apply expertise in strategic planning and client management to achieve further success.'
    },
    theme: {
      fontFamily: 'Source Sans Pro',
      primaryColor: '#1f4f46',
      secondaryColor: '#d97706',
      textColor: '#111827',
      sectionSpacing: 18,
      pageSize: 'A4'
    },
    sections: [
      createExperienceSection([
        {
          id: createResumeId('experience'),
          company: 'TechSolutions Inc.',
          position: 'Senior Account Executive',
          location: 'Denver, Colorado',
          startDate: '01/2022',
          endDate: 'Present',
          current: true,
          summary: '',
          highlights: [
            'Drove a 150% increase in B2B software solution sales over a two-year period by applying consultative sales and strategic partner management.',
            'Initiated and nurtured relationships with key decision-makers across 40+ national accounts, improving client retention by 35%.',
            'Exceeded quarterly sales targets by an average of 25% through structured pipeline management and accurate revenue forecasting.'
          ]
        },
        {
          id: createResumeId('experience'),
          company: 'Global Logistics Solutions',
          position: 'Account Manager',
          location: 'Denver, Colorado',
          startDate: '08/2016',
          endDate: '12/2019',
          current: false,
          summary: '',
          highlights: [
            'Grew territory sales by 80% within three years through a robust pipeline of new business in logistics and transportation.',
            'Managed 25+ major accounts, increasing high-quality client service and improving average deal size.',
            'Coordinated with cross-functional teams to address client issues, achieving a 97% customer satisfaction rate.'
          ]
        },
        {
          id: createResumeId('experience'),
          company: 'Innov8 Electronics',
          position: 'Sales Associate',
          location: 'Denver, Colorado',
          startDate: '03/2013',
          endDate: '05/2016',
          current: false,
          summary: '',
          highlights: [
            'Generated $1.2 million in sales within the consumer electronics sector by creating and nurturing a client base through personalized service.',
            'Collaborated with program teams on in-store promotions and product education initiatives that increased customer engagement.'
          ]
        }
      ]),
      createSkillsSection([
        { id: createResumeId('skill'), name: 'B2B Sales', level: 'expert' },
        { id: createResumeId('skill'), name: 'Account Management', level: 'expert' },
        { id: createResumeId('skill'), name: 'CRM Forecasting', level: 'advanced' },
        { id: createResumeId('skill'), name: 'Client Retention', level: 'advanced' },
        { id: createResumeId('skill'), name: 'Pipeline Strategy', level: 'advanced' }
      ]),
      createProjectsSection([
        {
          id: createResumeId('project'),
          name: 'Regional Account Growth Program',
          role: 'Sales Lead',
          url: '',
          startDate: '',
          endDate: '',
          description: 'Designed a territory growth plan that improved prospect qualification, shortened sales cycles, and increased repeat business across strategic accounts.',
          technologies: ['Salesforce', 'HubSpot', 'Account Planning']
        }
      ]),
      createEducationSection([
        {
          id: createResumeId('education'),
          institution: 'University of Denver',
          degree: 'Master of Business Administration',
          field: '',
          location: 'Denver, Colorado',
          startDate: '',
          endDate: '01/2011',
          score: ''
        },
        {
          id: createResumeId('education'),
          institution: 'Colorado State University',
          degree: 'Bachelor of Science in Marketing',
          field: '',
          location: 'Fort Collins, Colorado',
          startDate: '',
          endDate: '01/2007',
          score: ''
        }
      ]),
      {
        id: createResumeId('section-achievements'),
        type: 'custom',
        title: 'Key Achievements',
        visible: true,
        order: 90,
        items: [
          {
            id: createResumeId('achievement'),
            title: 'Maximized Referral Business',
            subtitle: '',
            description: 'Initiated a client referral program that resulted in a sustained 10% YoY increase in business.'
          },
          {
            id: createResumeId('achievement'),
            title: 'Strategic Account Growth',
            subtitle: '',
            description: 'Successfully expanded key account portfolio by 40% within 12 months at Global Logistics Solutions.'
          }
        ]
      }
    ]
  };
}

export function createTemplatePreviewDocument(template: ResumeTemplate | null | undefined): ResumeDocument | null {
  if (!template) {
    return null;
  }

  const document = createDefaultResumeDocument(templateKeyFromTemplate(template), template.name);
  return {
    ...document,
    theme: {
      ...document.theme,
      ...previewThemeForTemplate(template)
    }
  };
}

export function createResumeDocumentFromEditorResume(
  resume: ResumeEditorResume,
  template?: ResumeTemplate | null
): ResumeDocument {
  const summarySection = resume.sections.find((section) => section.sectionType === 'SUMMARY');
  const summaryContent = summarySection ? parseRecord(summarySection.contentJson) : {};
  const templateKey = templateKeyFromEditorResume(resume, template);

  return {
    schemaVersion: 1,
    title: resume.title || 'Untitled Resume',
    templateKey,
    personal: {
      fullName: stringValue(summaryContent['fullName'], 'Candidate Name'),
      headline: stringValue(summaryContent['headline'], 'Professional Headline'),
      email: stringValue(summaryContent['email']),
      phone: stringValue(summaryContent['phone']),
      location: stringValue(summaryContent['location']),
      links: stringValue(summaryContent['links']),
      summary: stringValue(summaryContent['text'], 'Add a short professional summary here.')
    },
    theme: themeConfigFromEditor(resume.themeJson, template),
    sections: resume.sections
      .filter((section) => section.isVisible && section.sectionType !== 'SUMMARY')
      .sort((left, right) => left.sectionOrder - right.sectionOrder)
      .map((section, index) => editorSectionToDocumentSection(section, index)),
    updatedAt: resume.updatedAt
  };
}

export function normalizeResumeDocument(
  value: unknown,
  title = 'My Resume',
  templateKey: ResumeTemplateKey = 'modern'
): ResumeDocument {
  if (isResumeDocument(value)) {
    const fallback = createDefaultResumeDocument(value.templateKey ?? templateKey, value.title || title);
    return {
      ...fallback,
      ...value,
      schemaVersion: 1,
      title: value.title || title,
      templateKey: value.templateKey ?? templateKey,
      personal: {
        ...fallback.personal,
        ...value.personal
      },
      theme: {
        ...fallback.theme,
        ...value.theme
      },
      sections: normalizeSections(value.sections)
    };
  }

  return legacyRecordToDocument(value, title, templateKey);
}

export function cloneResumeDocument(document: ResumeDocument): ResumeDocument {
  return JSON.parse(JSON.stringify(document)) as ResumeDocument;
}

export function sortedVisibleSections(document: ResumeDocument): ResumeDocumentSection[] {
  return [...document.sections]
    .filter((section) => section.visible)
    .sort((left, right) => left.order - right.order);
}

export function replaceSection(
  document: ResumeDocument,
  updatedSection: ResumeDocumentSection
): ResumeDocument {
  return {
    ...document,
    sections: document.sections.map((section) => section.id === updatedSection.id ? updatedSection : section),
    updatedAt: new Date().toISOString()
  };
}

export function firstSectionOfType<TSection extends ResumeDocumentSection>(
  document: ResumeDocument,
  type: TSection['type']
): TSection | null {
  return (document.sections.find((section) => section.type === type) as TSection | undefined) ?? null;
}

export function createExperienceSection(items: WorkExperienceSection['items'] = []): WorkExperienceSection {
  return {
    id: createResumeId('section-experience'),
    type: 'experience',
    title: 'Experience',
    visible: true,
    order: 10,
    items
  };
}

export function createEducationSection(items: EducationSection['items'] = []): EducationSection {
  return {
    id: createResumeId('section-education'),
    type: 'education',
    title: 'Education',
    visible: true,
    order: 40,
    items
  };
}

export function createSkillsSection(items: SkillsSection['items'] = []): SkillsSection {
  return {
    id: createResumeId('section-skills'),
    type: 'skills',
    title: 'Skills',
    visible: true,
    order: 20,
    items
  };
}

export function createProjectsSection(items: ProjectsSection['items'] = []): ProjectsSection {
  return {
    id: createResumeId('section-projects'),
    type: 'projects',
    title: 'Projects',
    visible: true,
    order: 30,
    items
  };
}

export function createCustomSection(title = 'Custom Section'): CustomSection {
  return {
    id: createResumeId('section-custom'),
    type: 'custom',
    title,
    visible: true,
    order: 90,
    items: [
      {
        id: createResumeId('custom-item'),
        title: 'Item title',
        subtitle: '',
        description: 'Add the custom detail you want this template to display.'
      }
    ]
  };
}

function legacyRecordToDocument(value: unknown, title: string, templateKey: ResumeTemplateKey): ResumeDocument {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const document = createDefaultResumeDocument(templateKey, stringValue(source['title'], title));

  const skills = lineValues(source['skills']).map((name) => ({
    id: createResumeId('skill'),
    name,
    level: 'intermediate' as SkillLevel
  }));

  const experience = lineValues(source['experience']).map((line) => ({
    id: createResumeId('experience'),
    company: '',
    position: line,
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    summary: '',
    highlights: [line]
  }));

  const projects = lineValues(source['projects']).map((line) => ({
    id: createResumeId('project'),
    name: line,
    role: '',
    url: '',
    startDate: '',
    endDate: '',
    description: line,
    technologies: []
  }));

  const education = lineValues(source['education']).map((line) => ({
    id: createResumeId('education'),
    institution: line,
    degree: line,
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    score: ''
  }));

  return {
    ...document,
    personal: {
      fullName: stringValue(source['fullName']),
      headline: stringValue(source['headline']),
      email: stringValue(source['email']),
      phone: stringValue(source['phone']),
      links: stringValue(source['links']),
      location: stringValue(source['location']),
      summary: stringValue(source['summary'], document.personal.summary)
    },
    theme: {
      ...document.theme,
      fontFamily: stringValue(source['designFont'], document.theme.fontFamily),
      primaryColor: stringValue(source['designAccent'], document.theme.primaryColor),
      textColor: stringValue(source['designText'], document.theme.textColor),
      pageSize: stringValue(source['pageFormat'], document.theme.pageSize) === 'Letter' ? 'Letter' : 'A4'
    },
    sections: [
      createExperienceSection(experience.length ? experience : firstSectionOfType<WorkExperienceSection>(document, 'experience')?.items ?? []),
      createSkillsSection(skills.length ? skills : firstSectionOfType<SkillsSection>(document, 'skills')?.items ?? []),
      createProjectsSection(projects.length ? projects : firstSectionOfType<ProjectsSection>(document, 'projects')?.items ?? []),
      createEducationSection(education.length ? education : firstSectionOfType<EducationSection>(document, 'education')?.items ?? [])
    ]
  };
}

function normalizeSections(sections: ResumeDocumentSection[]): ResumeDocumentSection[] {
  if (!Array.isArray(sections) || sections.length === 0) {
    return createDefaultResumeDocument().sections;
  }

  return sections.map((section, index) => ({
    ...section,
    visible: section.visible !== false,
    order: typeof section.order === 'number' ? section.order : (index + 1) * 10,
    items: Array.isArray(section.items) ? section.items : []
  })) as ResumeDocumentSection[];
}

function isResumeDocument(value: unknown): value is ResumeDocument {
  return !!value
    && typeof value === 'object'
    && 'personal' in value
    && 'sections' in value
    && 'theme' in value;
}

function lineValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (item && typeof item === 'object' && 'value' in item) {
        return String((item as { value?: unknown }).value ?? '');
      }
      return String(item ?? '');
    })
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function templateKeyFromEditorResume(
  resume: ResumeEditorResume,
  template?: ResumeTemplate | null
): ResumeTemplateKey {
  if (template) {
    return templateKeyFromTemplate(template);
  }

  return templateKeyFromTemplate({
    id: resume.templateId,
    name: resume.templateName,
    category: '',
    roleType: '',
    experienceLevel: '',
    layoutType: resume.templateLayoutType,
    styleType: resume.templateStyleType,
    atsFriendly: false,
    tagsJson: '[]',
    previewImageUrl: '',
    templateKey: resume.templateKey,
    htmlTemplatePath: '',
    cssTemplatePath: '',
    supportedSectionsJson: resume.templateSupportedSectionsJson,
    premium: resume.premiumTemplate
  });
}

function themeConfigFromEditor(themeJson: string, template?: ResumeTemplate | null): ResumeThemeConfig {
  const parsed = parseRecord(themeJson) as Partial<ResumeTheme>;
  const previewTheme = template ? previewThemeForTemplate(template) : {};
  const primaryColor = stringValue(parsed['headerColor'], stringValue(parsed['primaryColor'], previewTheme.primaryColor ?? '#1f4f46'));

  return {
    fontFamily: stringValue(parsed['fontFamily'], 'Source Sans Pro'),
    primaryColor,
    secondaryColor: stringValue(parsed['primaryColor'], previewTheme.secondaryColor ?? '#d97706'),
    textColor: '#111827',
    sectionSpacing: 16,
    pageSize: 'A4'
  };
}

function editorSectionToDocumentSection(section: ResumeSection, index: number): ResumeDocumentSection {
  const content = parseRecord(section.contentJson);
  const base = {
    id: `section-${section.id}`,
    title: section.sectionTitle,
    visible: section.isVisible,
    order: section.sectionOrder || (index + 1) * 10
  };

  switch (section.sectionType) {
    case 'EXPERIENCE':
      return {
        ...base,
        type: 'experience',
        items: arrayValue(content['items']).map((item, itemIndex) => editorExperienceItem(section.id, item, itemIndex))
      };
    case 'EDUCATION':
      return {
        ...base,
        type: 'education',
        items: arrayValue(content['items']).map((item, itemIndex) => editorEducationItem(section.id, item, itemIndex))
      };
    case 'SKILLS':
      return {
        ...base,
        type: 'skills',
        items: editorSkillItems(section.id, content)
      };
    case 'PROJECTS':
      return {
        ...base,
        type: 'projects',
        items: arrayValue(content['items']).map((item, itemIndex) => editorProjectItem(section.id, item, itemIndex))
      };
    default:
      return {
        ...base,
        type: 'custom',
        items: editorCustomItems(section.id, section.sectionType, content)
      };
  }
}

function editorExperienceItem(sectionId: number, value: unknown, index: number): WorkExperience {
  const item = recordValue(value);
  return {
    id: `experience-${sectionId}-${index}`,
    company: stringValue(item['company'], 'Company Name'),
    position: stringValue(item['role'], stringValue(item['position'], 'Role Title')),
    location: stringValue(item['location']),
    startDate: stringValue(item['startDate']),
    endDate: stringValue(item['endDate'], 'Present'),
    summary: '',
    highlights: textList(item['description'])
  };
}

function editorEducationItem(sectionId: number, value: unknown, index: number): Education {
  const item = recordValue(value);
  return {
    id: `education-${sectionId}-${index}`,
    institution: stringValue(item['institute'], stringValue(item['institution'], 'Institute Name')),
    degree: stringValue(item['degree'], 'Degree Name'),
    field: stringValue(item['field']),
    location: stringValue(item['location']),
    startDate: stringValue(item['startDate']),
    endDate: stringValue(item['endDate']),
    score: stringValue(item['score'])
  };
}

function editorSkillItems(sectionId: number, content: Record<string, unknown>): Skill[] {
  const groups = arrayValue(content['groups']);
  if (!groups.length) {
    return textList(content['skills']).map((name, index) => ({
      id: `skill-${sectionId}-${index}`,
      name,
      level: 'intermediate'
    }));
  }

  return groups.flatMap((group, groupIndex) => {
    const record = recordValue(group);
    return textList(record['skills']).map((name, skillIndex) => ({
      id: `skill-${sectionId}-${groupIndex}-${skillIndex}`,
      name,
      level: skillLevelFromText(record['title'])
    }));
  });
}

function editorProjectItem(sectionId: number, value: unknown, index: number): Project {
  const item = recordValue(value);
  const subtitle = stringValue(item['subtitle'], stringValue(item['role']));
  return {
    id: `project-${sectionId}-${index}`,
    name: stringValue(item['title'], stringValue(item['name'], 'Project Name')),
    role: subtitle,
    url: stringValue(item['url']),
    startDate: stringValue(item['startDate']),
    endDate: stringValue(item['endDate']),
    description: textList(item['description']).join(' '),
    technologies: textList(item['technologies']).length ? textList(item['technologies']) : splitCommaList(subtitle)
  };
}

function editorCustomItems(sectionId: number, sectionType: string, content: Record<string, unknown>): CustomSectionItem[] {
  return arrayValue(content['items']).map((value, index) => {
    const item = recordValue(value);
    if (sectionType === 'LANGUAGES') {
      return {
        id: `custom-${sectionId}-${index}`,
        title: stringValue(item['name'], 'Language'),
        subtitle: stringValue(item['level']),
        description: ''
      };
    }

    return {
      id: `custom-${sectionId}-${index}`,
      title: stringValue(item['title'], stringValue(item['name'], 'Item')),
      subtitle: [stringValue(item['subtitle']), stringValue(item['issuer']), stringValue(item['year'])]
        .filter(Boolean)
        .join(' | '),
      description: textList(item['description']).join(' ')
    };
  });
}

function parseRecord(json: string): Record<string, unknown> {
  try {
    return recordValue(JSON.parse(json));
  } catch {
    return {};
  }
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function textList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function splitCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function skillLevelFromText(value: unknown): SkillLevel {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('expert')) {
    return 'expert';
  }
  if (normalized.includes('advanced')) {
    return 'advanced';
  }
  if (normalized.includes('beginner')) {
    return 'beginner';
  }
  return 'intermediate';
}

function previewThemeForTemplate(template: ResumeTemplate): Partial<ResumeThemeConfig> {
  const templateSignal = [
    template.templateKey,
    template.category,
    template.layoutType,
    template.styleType,
    template.name
  ].join(' ').toLowerCase();

  if (templateSignal.includes('creative')) {
    return {
      primaryColor: '#8f2d56',
      secondaryColor: '#c2410c'
    };
  }

  if (templateSignal.includes('compact')) {
    return {
      primaryColor: '#166534',
      secondaryColor: '#4f46e5',
      sectionSpacing: 12
    };
  }

  if (templateSignal.includes('ats')) {
    return {
      primaryColor: '#111827',
      secondaryColor: '#374151',
      sectionSpacing: 14
    };
  }

  if (templateSignal.includes('minimal') || templateSignal.includes('internship')) {
    return {
      primaryColor: '#111827',
      secondaryColor: '#64748b',
      sectionSpacing: 16
    };
  }

  if (templateSignal.includes('professional') || templateSignal.includes('mba')) {
    return {
      primaryColor: '#1f2937',
      secondaryColor: '#9a3412'
    };
  }

  if (templateSignal.includes('two column') || templateSignal.includes('fullstack')) {
    return {
      primaryColor: '#5b5cf0',
      secondaryColor: '#2563eb'
    };
  }

  if (templateSignal.includes('developer') || templateSignal.includes('java') || templateSignal.includes('backend')) {
    return {
      primaryColor: '#2563eb',
      secondaryColor: '#0f766e'
    };
  }

  if (templateSignal.includes('clean') || templateSignal.includes('ats')) {
    return {
      primaryColor: '#1f4f46',
      secondaryColor: '#d97706'
    };
  }

  return {};
}
