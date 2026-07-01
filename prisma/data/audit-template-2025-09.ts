/**
 * Audit Template Seed — Scout Association Safe Scouting Premises Audit Tool
 * Version: September 2025
 *
 * Use this as the single source of truth for the AuditTemplate.sections JSON.
 * Run as a Prisma seed: `npx prisma db seed`
 *
 * Item shapes:
 *   Atomic item  — { id, question, guidance?, responseType, requiresDocument, documentType?, profileFlag? }
 *   Group item   — { id, label, guidance?, responseType: "GROUP", requiresDocument: false, profileFlag?,
 *                    subQuestions: [{ id, question, responseType, requiresDocument, documentType? }] }
 *
 * ResponseType values:
 *   YES_NO_NA_ACTION  — yes / no / not-applicable / action-needed
 *   OPEN_TEXT         — free-text answer
 *   DATE_UPLOAD       — date + document upload (for certificates / reports)
 *   GROUP             — parent container; render sub-questions individually
 *
 * profileFlag: item shown only when premises profile has that flag = true.
 *   Flags: hasGas, hasSleeping, hasCateringKitchen, hasGrounds, hasVehicles,
 *          hasPlantMachinery, hasThirdPartyUsers, floodRisk
 *
 * requiresDocument: true → prompt user to upload a file and enter an expiry date.
 */

export const AUDIT_TEMPLATE_V2025_09 = {
  version: "2025-09",
  publishedAt: new Date("2025-09-01"),
  sections: [

    // ── PART 1: RELEVANT TO ALL PREMISES ──────────────────────────────────────

    {
      id: "s1",
      number: 1,
      title: "Organisation of safety and management",
      scope: "ALL",
      items: [
        {
          id: "s1-q1",
          label: "Management committee and trustee responsibilities",
          guidance: "Consider responsibilities or consequences for both action and inaction.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s1-q1a",
              question: "Is there a management committee appointed for the premises?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s1-q1b",
              question: "How often does the committee report to the relevant trustee board?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s1-q1c",
              question: "How are the trustees made aware of their responsibilities for the management of the premises?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s1-q2",
          label: "Risk assessments — suitability, sharing and review",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s1-q2a",
              question: "Are the current premises risk assessments suitable and sufficient?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s1-q2b",
              question: "How are risk assessments shared with team members and users?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s1-q2c",
              question: "Are risk assessments reviewed regularly (at least annually)?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s1-q3",
          question: "Are there suitable and sufficient safety Method Statements (operating procedures) for the tasks being carried out?",
          guidance: "Once completed, all RAMS (Risk Assessments & Method Statements) need to be easily accessible to staff and compliance with these monitored.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s1-q4",
          question: "How and where are records for maintenance or compliance checks stored?",
          guidance: "Make sure these are accessible for future reference and for changes in trustees.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s1-q5",
          question: "Is appropriate signage and other controls in place as identified through risk assessments?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s1-q6",
          label: "Accessibility assessment and adjustments",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s1-q6a",
              question: "What assessment has been made of the site for those with additional needs?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s1-q6b",
              question: "What reasonable adjustments have been put in place to assist those needs?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s1-q7",
          label: "Notice board / safety signage",
          guidance: "Should include: Yellow Card, Alcohol & Drug guidance, Gas Safety, Carbon Monoxide poster, Fire Evacuation Procedures, Good Hygiene, Food Hygiene, and other safety information.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s1-q7a",
              question: "Is there a notice board or visible signage on the premises for both visitors and staff/volunteers to see?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s1-q7b",
              question: "Are the notices regularly checked to ensure they are current?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s1-q8",
          question: "What guidance and controls are in place for lone working for volunteers or visitors?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s2",
      number: 2,
      title: "Monitoring and Incident Reporting",
      scope: "ALL",
      items: [
        {
          id: "s2-q1",
          question: "Are incidents and near misses recorded and reported appropriately — including RIDDOR where required?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s2-q2",
          question: "How are trustees monitoring that processes are being followed, adequate records are being kept, and incidents are being reviewed?",
          guidance: "See learning review guidance on the Scout website.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s2-q3",
          question: "Do volunteers understand when incidents need to be reported and where to report them?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s3",
      number: 3,
      title: "Fire",
      scope: "ALL",
      items: [
        {
          id: "s3-q1",
          label: "Fire Risk Assessment",
          guidance: "Outstanding actions identified in the Fire RA should be recorded as actions.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q1a",
              question: "Is a Fire Risk Assessment in place and completed by a competent person?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "FIRE_RA",
            },
            {
              id: "s3-q1b",
              question: "When was the Fire Risk Assessment last reviewed?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s3-q1c",
              question: "Who carried out the most recent Fire Risk Assessment review?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q2",
          label: "FRA shared with trustees and sufficiency",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q2a",
              question: "Has the Fire Risk Assessment been shared with the Trustees?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q2b",
              question: "Is the Fire Risk Assessment considered sufficient?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q3",
          label: "Fire alarm system",
          guidance: "Best practice is to test alarms weekly.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q3a",
              question: "Are fire alarms installed, and what type are they?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s3-q3b",
              question: "Are smoke and/or heat detectors present?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q3c",
              question: "Are manual call points (break-glass) present?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q3d",
              question: "What is the testing and recording regime for the fire alarm system?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q4",
          question: "Is the fire alarm system suitable for use when people are sleeping in the building (e.g. an automated L2 system)?",
          guidance: "An automated alarm system (L2) should be in place where sleeping accommodation is provided.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "hasSleeping",
        },
        {
          id: "s3-q5",
          question: "Are there any additional fire safety measures put in place specifically for sleepovers?",
          guidance: "Where sleeping is not the building's primary purpose, additional temporary measures should be considered.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "hasSleeping",
        },
        {
          id: "s3-q6",
          label: "Smoke detectors and CO monitors",
          guidance: "Best practice is to test alarms weekly.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q6a",
              question: "Are smoke detectors and carbon monoxide monitors in good working order and covering all hazardous zones?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q6b",
              question: "What is the testing regime for smoke detectors and CO monitors?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q7",
          label: "Fire extinguishers",
          guidance: "A regular visual check by a team member as well as annual servicing is good practice.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q7a",
              question: "Are fire extinguishers in good working order with a current service record?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "FIRE_EXTINGUISHER",
            },
            {
              id: "s3-q7b",
              question: "Are extinguishers appropriately fixed in position with correct signage?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q8",
          question: "Is there safe access and egress from the building (able to get out quickly in an emergency)?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q9",
          label: "Emergency lighting — suitability",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q9a",
              question: "Is the emergency lighting suitable and sufficient?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q9b",
              question: "Does it illuminate all evacuation routes and emergency exits?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q10",
          label: "Emergency lighting — testing regime",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q10a",
              question: "Daily — is the visual indicator light checked to confirm the system is healthy?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q10b",
              question: "Monthly — is a 1-minute function test carried out and recorded?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q10c",
              question: "Annually — is a full test carried out, checking visibility of lighting, signage and fire exit routes, by a competent person?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "EMERGENCY_LIGHTING",
            },
            {
              id: "s3-q10d",
              question: "Have any remedial actions identified through testing been completed?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q11",
          question: "If there is no automatic emergency lighting, how are users guided to emergency routes?",
          guidance: "E.g. glow-in-the-dark signs, torches.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s3-q12",
          question: "When was the last evacuation drill carried out?",
          guidance: "Sections are advised to practice this each term. All unplanned evacuations/alarms should also be recorded.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s3-q13",
          question: "What Personal Emergency Evacuation Plans (PEEPs) are in place for those with accessible needs?",
          guidance: "An example PEEP can be found on the Scout website.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q14",
          label: "Fire doors",
          guidance: "Fire doors protect areas from high-risk fire spread, e.g. a boiler room door in a fire escape corridor.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s3-q14a",
              question: "Is there a register of all fire doors on the premises?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s3-q14b",
              question: "How often are fire doors inspected, when was the last inspection, and who carried it out?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s3-q14c",
              question: "What remedial actions have been identified and completed following fire door inspections?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s3-q15",
          question: "Are door closers fitted to control the speed and weight of closing?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q16",
          question: "Are door finger guards fitted to protect hands from the hinged gap?",
          guidance: "Make teams aware of the risks from trapped fingers.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s4",
      number: 4,
      title: "Emergency Procedures",
      scope: "ALL",
      items: [
        {
          id: "s4-q1",
          question: "Are there documented procedures for the management of foreseeable emergencies, including fire, working at height, confined spaces, loss of services, and flooding?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s5",
      number: 5,
      title: "Electrical",
      scope: "ALL",
      items: [
        {
          id: "s5-q1",
          label: "PAT and fixed electrical testing",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s5-q1a",
              question: "When was portable appliance testing (PAT) last completed?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "PAT",
            },
            {
              id: "s5-q1b",
              question: "When was the Fixed Electrical Installation Condition Report (EICR) last completed?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "EICR",
            },
            {
              id: "s5-q1c",
              question: "Have any remedial works identified from these tests been completed?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s5-q2",
          label: "Electrical boards and cupboards",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s5-q2a",
              question: "Are electrical boards and cupboards secure with access restricted?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s5-q2b",
              question: "Have electrical boards been included in the EICR inspection?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s5-q3",
          question: "Are wall sockets flush to the wall, screwed in well, and with casing in good condition?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s5-q4",
          label: "General lighting",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s5-q4a",
              question: "Is general lighting working inside the building?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s5-q4b",
              question: "Is external and security lighting working?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s5-q4c",
              question: "Is all lighting suitable and sufficient for its purpose?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s5-q5",
          question: "Where lightning protection is installed, has it had its annual inspection and certification?",
          guidance: null,
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "OTHER",
        },
      ],
    },

    {
      id: "s6",
      number: 6,
      title: "Gas",
      scope: "ALL",
      profileFlag: "hasGas",
      items: [
        {
          id: "s6-q1",
          question: "Have all gas appliances been serviced as required by a Gas Safe registered contractor? Provide a list of all appliances with check dates.",
          guidance: "Note name of Gas Safe contractor used.",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "GAS_SAFE",
        },
        {
          id: "s6-q2",
          question: "Are interlocks in place between cooker, extractors and alarm?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "hasCateringKitchen",
        },
        {
          id: "s6-q3",
          label: "Carbon monoxide monitors and chimneys",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s6-q3a",
              question: "Are carbon monoxide monitors and alarms fitted and regularly checked?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s6-q3b",
              question: "If fireplaces are present, have the chimneys been swept recently?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s6-q4",
          question: "When did extraction units and cooker hoods last receive annual independent inspection and cleaning?",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "DATE_UPLOAD",
          requiresDocument: false,
          profileFlag: "hasCateringKitchen",
        },
        {
          id: "s6-q5",
          label: "Bulk gas",
          guidance: "Record who carried out the checks.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s6-q5a",
              question: "Is bulk gas stored or used on this site?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s6-q5b",
              question: "When was the bulk gas installation last checked for compliance, and by whom?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s6-q6",
          label: "Bottled gas storage",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s6-q6a",
              question: "Is bottled gas stored on site?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s6-q6b",
              question: "How is it stored safely (e.g. locked exterior cage, upright and secured)?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s7",
      number: 7,
      title: "Asbestos Management",
      scope: "ALL",
      items: [
        {
          id: "s7-q1",
          label: "Asbestos survey",
          guidance: "How is the survey accessible to the trustees?",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s7-q1a",
              question: "Has an asbestos survey been carried out for the site?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "ASBESTOS",
            },
            {
              id: "s7-q1b",
              question: "How is the asbestos survey made accessible to trustees and future maintainers?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s7-q2",
          label: "Asbestos Management Plan",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s7-q2a",
              question: "What is the date of the current Asbestos Management Plan (AMP)?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s7-q2b",
              question: "When was the AMP last reviewed?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s7-q3",
          label: "Asbestos inspections",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s7-q3a",
              question: "Have regular inspections of identified asbestos been carried out?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s7-q3b",
              question: "How are asbestos inspection records kept and stored?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s8",
      number: 8,
      title: "Water Quality (Legionella)",
      scope: "ALL",
      items: [
        {
          id: "s8-q1",
          label: "Legionella Management Plan and risk assessment",
          guidance: "Recommended every 2 years for more complex water systems. HSE guidance — ACOP L8 + HSG274.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s8-q1a",
              question: "Is there a Legionella Management Plan (LMP) in place?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s8-q1b",
              question: "When was the last Water Quality Risk Assessment completed?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "LEGIONELLA",
            },
          ],
        },
        {
          id: "s8-q2",
          label: "Legionella checks — routine monitoring",
          guidance: "An example LMP is available on the Scout website. Section 6.0 gives the full list of checks required.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s8-q2a",
              question: "Weekly — are all taps, showers and standpipes flushed as required?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s8-q2b",
              question: "Monthly — are temperature checks carried out at sentinel outlets?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s8-q2c",
              question: "Quarterly — are shower heads cleaned and descaled?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s8-q2d",
              question: "Annually — are all outlets checked?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s8-q2e",
              question: "How are all Legionella monitoring checks recorded?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s9",
      number: 9,
      title: "Use by third parties",
      scope: "ALL",
      items: [
        {
          id: "s9-q1",
          question: "Do other groups or third parties also use the site?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s9-q2",
          question: "What naturally occurring hazards on the site do visitors need to be made aware of?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s9-q3",
          question: "Are there maintenance tasks being carried out that could affect visitors or others in your area of operation?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s9-q4",
          question: "What Scout activities at the premises may present a hazard to visitors or others not actively involved (e.g. pioneering structures, climbing equipment, campfires)?",
          guidance: "E.g. pioneering structures disassembled after session; climbing equipment returned to locked storage; campfires doused and checked before leaving.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s9-q5",
          question: "What controls are in place to remove or reduce risks to other users and casual visitors?",
          guidance: "Are necessary signage or barriers in place?",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s10",
      number: 10,
      title: "Access to the premises",
      scope: "ALL",
      items: [
        {
          id: "s10-q1",
          question: "How is access to the premises controlled for both pedestrians and vehicles?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s10-q2",
          question: "How do you know who is on the premises at any point in time?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s10-q3",
          label: "Public access",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s10-q3a",
              question: "Is there public access to the site?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s10-q3b",
              question: "How is public access managed when no representative is on site?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s10-q4",
          label: "CCTV",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s10-q4a",
              question: "Is CCTV installed on the premises?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s10-q4b",
              question: "How is CCTV managed (data retention, access controls, GDPR compliance)?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s10-q5",
          label: "Paths and access routes",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s10-q5a",
              question: "What condition are the paths and access roads in, and what regular checks are made?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s10-q5b",
              question: "Do they present any risk of hazard or damage to pedestrians or vehicles?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s10-q5c",
              question: "Is there adequate lighting for paths and access routes?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s10-q6",
          question: "Are there any parts of the site that are derelict or hidden away? Consider physical dangers and unseen spaces for inappropriate behaviour (e.g. drugs, alcohol, safeguarding issues).",
          guidance: "Consider fencing, signage and regular checks for these areas.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s10-q7",
          label: "Disability access",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s10-q7a",
              question: "Is there disability access to the premises?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s10-q7b",
              question: "How often is disability access checked to ensure it remains fit for use?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s11",
      number: 11,
      title: "Chemicals and hazardous substances (COSHH)",
      scope: "ALL",
      items: [
        {
          id: "s11-q1",
          question: "What chemicals or hazardous substances are present on the premises?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s11-q2",
          question: "How and where are hazardous substances stored securely and appropriately?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s11-q3",
          label: "Material Safety Data Sheets",
          guidance: "Domestic products may have the necessary information on the label.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s11-q3a",
              question: "Are Material Safety Data Sheets (SDS) available for all chemicals on site?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s11-q3b",
              question: "When were the data sheets last reviewed?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s11-q4",
          label: "COSHH Risk Assessments",
          guidance: "Domestic products may have the necessary information on the label.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s11-q4a",
              question: "Have COSHH Risk Assessments been produced for all hazardous substances in use?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s11-q4b",
              question: "Have these assessments been made available to staff and users?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s11-q4c",
              question: "When were the COSHH assessments last reviewed, and by whom?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s12",
      number: 12,
      title: "Equipment",
      scope: "ALL",
      items: [
        {
          id: "s12-q1",
          question: "Has camping and Group-type equipment been checked and serviced for safety issues (e.g. gas or petrol stoves, lamps)?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s12-q2",
          question: "Who oversees and maintains this equipment?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s12-q3",
          question: "How is equipment safely stored?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s12-q4",
          label: "Equipment inventory",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s12-q4a",
              question: "Is there an inventory of all equipment and tools?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s12-q4b",
              question: "Who maintains the inventory and how often is it updated?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s12-q5",
          label: "Equipment servicing and external inspection",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s12-q5a",
              question: "Has all equipment been regularly serviced and maintained in accordance with manufacturer's recommendations?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s12-q5b",
              question: "Does any equipment require external or statutory inspection, and if so is this up to date?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s12-q6",
          label: "Pioneering equipment",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s12-q6a",
              question: "Do you have pioneering equipment (ropes, spars, lashings, etc.)?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s12-q6b",
              question: "Is the pioneering equipment in safe condition?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s12-q6c",
              question: "Are there suitable and safe areas designated for its use?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s13",
      number: 13,
      title: "Flood Risk",
      scope: "ALL",
      items: [
        {
          id: "s13-q1",
          question: "Are you aware of the flood risk for your property (surface water, river, sea)?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s13-q2",
          question: "If your property has a medium or higher flood risk, do you have a flood risk management plan in place?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "floodRisk",
        },
        {
          id: "s13-q3",
          question: "Is your property insurer aware of the flooding risk?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "floodRisk",
        },
      ],
    },

    // ── PART 2: LARGER PREMISES, CAMPSITES AND ACTIVITY CENTRES ──────────────

    {
      id: "s14",
      number: 14,
      title: "Staff and volunteers",
      scope: "EXTENDED",
      subsections: [
        {
          id: "s14a",
          title: "Staff and volunteers — general",
          items: [
            {
              id: "s14-q1",
              question: "Are there paid staff employed or used at the premises?",
              guidance: "E.g. part-time cleaners or activity staff.",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q2",
              question: "Is there a process in place for the recruitment of staff and volunteers, and is this being followed consistently?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q3",
              question: "Have appropriate vetting and disclosure checks been undertaken on those involved at the premises?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q4",
              label: "Membership system records",
              guidance: null,
              responseType: "GROUP",
              requiresDocument: false,
              subQuestions: [
                {
                  id: "s14-q4a",
                  question: "Are all staff and volunteers with premises roles recorded on the national membership system?",
                  responseType: "YES_NO_NA_ACTION",
                  requiresDocument: false,
                },
                {
                  id: "s14-q4b",
                  question: "How is this managed and kept up to date when people join or leave?",
                  responseType: "OPEN_TEXT",
                  requiresDocument: false,
                },
              ],
            },
            {
              id: "s14-q5",
              label: "Staff and volunteer policies",
              guidance: "Policies should cover: Yellow Card (safeguarding), Code of conduct, Alcohol & Drugs, Accommodation use, Manager reviews, Concern reporting, Dress code, Site sign-in, Lone working, Health & Safety.",
              responseType: "GROUP",
              requiresDocument: false,
              subQuestions: [
                {
                  id: "s14-q5a",
                  question: "Are the required policies in place for staff and volunteers (Yellow Card, Code of Conduct, Alcohol & Drugs, Lone Working, H&S, etc.)?",
                  responseType: "YES_NO_NA_ACTION",
                  requiresDocument: false,
                },
                {
                  id: "s14-q5b",
                  question: "Are these policies regularly reviewed and readily available to all staff and volunteers?",
                  responseType: "YES_NO_NA_ACTION",
                  requiresDocument: false,
                },
              ],
            },
            {
              id: "s14-q6",
              label: "Training and competency",
              guidance: "Training areas: Safeguarding, Safety, First Aid, GDPR, activity-specific, maintenance-specific.",
              responseType: "GROUP",
              requiresDocument: false,
              subQuestions: [
                {
                  id: "s14-q6a",
                  question: "What training is provided for staff and volunteers (Safeguarding, Safety, First Aid, GDPR, activity-specific, maintenance-specific)?",
                  responseType: "OPEN_TEXT",
                  requiresDocument: false,
                },
                {
                  id: "s14-q6b",
                  question: "How is training recorded?",
                  responseType: "OPEN_TEXT",
                  requiresDocument: false,
                },
                {
                  id: "s14-q6c",
                  question: "How is ongoing competency monitored, and by whom?",
                  responseType: "OPEN_TEXT",
                  requiresDocument: false,
                },
              ],
            },
            {
              id: "s14-q7",
              label: "Safety induction",
              guidance: null,
              responseType: "GROUP",
              requiresDocument: false,
              subQuestions: [
                {
                  id: "s14-q7a",
                  question: "What safety induction is provided when staff or volunteers take up a new role?",
                  responseType: "OPEN_TEXT",
                  requiresDocument: false,
                },
                {
                  id: "s14-q7b",
                  question: "Is the induction suitable and sufficient?",
                  responseType: "YES_NO_NA_ACTION",
                  requiresDocument: false,
                },
              ],
            },
            {
              id: "s14-q8",
              question: "Are staff and volunteers easily recognisable to visitors and each other?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q9",
              question: "How are language barriers managed for vital communications?",
              guidance: "Pictograms can be used to help.",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s14b",
          title: "Staff and volunteer accommodation",
          items: [
            {
              id: "s14-q10",
              label: "Staff area boundaries and under-18 accommodation",
              guidance: "Safeguarding Code of Practice: provide separate sleeping accommodation for young people, adults and Young Leaders working with a younger section.",
              responseType: "GROUP",
              requiresDocument: false,
              profileFlag: "hasSleeping",
              subQuestions: [
                {
                  id: "s14-q10a",
                  question: "What clear boundaries are in place for staff-only areas, for both welfare and safeguarding?",
                  responseType: "OPEN_TEXT",
                  requiresDocument: false,
                },
                {
                  id: "s14-q10b",
                  question: "How is separate sleeping accommodation provided for those under 18 who are supporting the premises?",
                  responseType: "OPEN_TEXT",
                  requiresDocument: false,
                },
              ],
            },
            {
              id: "s14-q11",
              question: "How are checks on upkeep, welfare and appropriate behaviour of staff in accommodation monitored and managed?",
              guidance: null,
              responseType: "OPEN_TEXT",
              requiresDocument: false,
              profileFlag: "hasSleeping",
            },
          ],
        },
      ],
      items: [],
    },

    {
      id: "s15",
      number: 15,
      title: "Guests and visitors",
      scope: "EXTENDED",
      items: [
        {
          id: "s15-q1",
          question: "How do visiting groups notify the centre of changes in numbers and participants?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s15-q2",
          question: "What checks are carried out on visitors during their stay to ensure their comfort and safety?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s15-q3",
          label: "Visitor checkout",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s15-q3a",
              question: "What process is in place for visiting groups to check out?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s15-q3b",
              question: "How do you confirm that all visitors have left the site?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s15-q4",
          question: "Is there a written record and agreement in place with users of the premises?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s15-q5",
          question: "How do staff and volunteers observe and report concerns about visitor behaviour — including alcohol and drugs, young people's welfare, safeguarding, safe activities, supervision during free time, and inappropriate photography?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s15-q6",
          label: "Non-Scout user safeguarding",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s15-q6a",
              question: "How are non-Scout users made aware of the procedures for reporting incidents and safeguarding concerns?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s15-q6b",
              question: "What safeguarding arrangements do non-Scout users have in place themselves?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s15-q7",
          label: "Bunk beds",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          profileFlag: "hasSleeping",
          subQuestions: [
            {
              id: "s15-q7a",
              question: "Is guidance provided to users on bunk bed safety risks?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s15-q7b",
              question: "Is the ladder fixed securely to the bed frame?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s15-q7c",
              question: "Is there at least 760mm clearance between the top bunk mattress and the ceiling?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s15-q7d",
              question: "Are all bunk bed gaps between 60mm and 75mm (no entrapment risk from gaps outside this range)?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s16",
      number: 16,
      title: "First Aid",
      scope: "EXTENDED",
      items: [
        {
          id: "s16-q1",
          label: "First aid cover and equipment",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s16-q1a",
              question: "Is there adequate trained first aid cover during activities?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s16-q1b",
              question: "What first aid equipment is available on site?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s16-q1c",
              question: "What process is in place to regularly check and restock first aid equipment?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s16-q2",
          label: "AED, trauma, bleed and anaphylaxis kits",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s16-q2a",
              question: "Is there a Defibrillator (AED), trauma kit, bleed kit and/or anaphylaxis kit on site?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s16-q2b",
              question: "What process is in place to regularly check and maintain these items?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s16-q3",
          question: "How are sharp objects and large amounts of medical waste disposed of?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s17",
      number: 17,
      title: "Contractor management",
      scope: "EXTENDED",
      items: [
        {
          id: "s17-q1",
          label: "Contractor competency, induction and documentation",
          guidance: "Competency evidence: references, qualifications, professional memberships.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s17-q1a",
              question: "How are contractor competencies assessed before work begins?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s17-q1b",
              question: "Are contractor inductions carried out and recorded?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s17-q1c",
              question: "Has the Yellow Card (safeguarding procedures) been shared with contractors?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s17-q1d",
              question: "What documentation is kept to evidence competency checks and inductions?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s17-q2",
          question: "How are contractors effectively and safely managed whilst on site?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s17-q3",
          question: "Are Risk Assessments and Method Statements (RAMS) from contractors suitable and sufficient?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s17-q4",
          question: "Are Permit to Work requirements in place and being observed and recorded?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s18",
      number: 18,
      title: "Work at Height",
      scope: "EXTENDED",
      items: [
        {
          id: "s18-q1",
          label: "Falls from height and confined spaces",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s18-q1a",
              question: "What areas on the site present a risk of falls from height (activities, roof, storage, etc.)?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s18-q1b",
              question: "How are these fall-from-height risks managed?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s18-q1c",
              question: "Are there any below-ground areas or confined spaces, and how are these managed?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s18-q2",
          label: "Scaffolding",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s18-q2a",
              question: "Are there any scaffolding structures on site (permanent or temporary)?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s18-q2b",
              question: "What inspection regime is in place for scaffolding?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s18-q2c",
              question: "What measures are in place to prevent unauthorised access or climbing on scaffolding?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s19",
      number: 19,
      title: "Manual Handling",
      scope: "EXTENDED",
      items: [
        {
          id: "s19-q1",
          question: "Have staff and volunteers received appropriate manual handling training for their tasks?",
          guidance: "Those involved in regular handling activity should receive refresher training from time to time.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s19-q2",
          question: "How have local handling risks (particularly in storage areas) been identified and what controls put in place?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s19-q3",
          question: "Is there suitable and sufficient equipment to assist with safe handling?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s20",
      number: 20,
      title: "Catering",
      scope: "EXTENDED",
      profileFlag: "hasCateringKitchen",
      items: [
        {
          id: "s20-q1",
          question: "What food safety control systems are in place, and are these in line with relevant regulations?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s20-q2",
          question: "What food safety and hygiene training has been received by staff?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s21",
      number: 21,
      title: "Housekeeping & General Site",
      scope: "EXTENDED",
      items: [
        {
          id: "s21-q1",
          label: "Waste management and pest control",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s21-q1a",
              question: "Is the site tidy and free from waste and rubbish?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s21-q1b",
              question: "Is there a documented process for waste disposal?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s21-q1c",
              question: "Is an appropriate pest control system in place with records?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s21-q2",
          question: "Is there a significant risk from items, equipment or locations that may cause slips, trips or falls?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s21-q3",
          label: "Loft hatches",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s21-q3a",
              question: "Are there any loft hatches on the premises?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s21-q3b",
              question: "What is the process for safe use of loft hatches?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s21-q3c",
              question: "How are loft hatches secured when not in use to prevent unplanned access?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s21-q4",
          question: "Are materials stored in a safe and appropriate manner?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s21-q5",
          label: "Workstation assessments (DSE)",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s21-q5a",
              question: "Have Workstation Assessments been carried out for regular computer/display screen users?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s21-q5b",
              question: "Have any remedial actions from these assessments been completed?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s21-q6",
          question: "What processes are in place for lone working or remote working?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s21-q7",
          label: "Site plans",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s21-q7a",
              question: "Are site plans available for the premises?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s21-q7b",
              question: "Do the site plans show underground and overhead services (gas, electric, water, drainage)?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s22",
      number: 22,
      title: "Plant, Machinery & Equipment",
      scope: "EXTENDED",
      profileFlag: "hasPlantMachinery",
      items: [
        {
          id: "s22-q1",
          label: "Racking and storage",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s22-q1a",
              question: "Is racking and storage safe for use?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s22-q1b",
              question: "Is racking and storage regularly inspected and the results recorded?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s22-q2",
          label: "Plant and machinery servicing and statutory inspection",
          guidance: "Use stickers to show service dates.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s22-q2a",
              question: "Has all plant and machinery been regularly serviced per manufacturer's recommendations?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s22-q2b",
              question: "Does any equipment require statutory external inspection (e.g. under LOLER or PUWER)?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s22-q2c",
              question: "If so, are these inspection processes in place and up to date?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s22-q3",
          label: "Ladder register and inspections",
          guidance: "Mark ladders with a unique ID to correspond to the register.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s22-q3a",
              question: "Are all ladders listed on a Ladder Register with unique IDs?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s22-q3b",
              question: "How are pre-use checks and periodic ladder inspections managed and recorded?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s22-q4",
          label: "Activities area and playground",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s22-q4a",
              question: "Do you have an activities area or playground?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s22-q4b",
              question: "What checking and maintenance plan is in place for activities or play equipment?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s22-q4c",
              question: "Is access to the equipment controlled when not in supervised use?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s22-q4d",
              question: "How is supervision of users of the activities area managed?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s23",
      number: 23,
      title: "Vehicles",
      scope: "EXTENDED",
      profileFlag: "hasVehicles",
      items: [
        {
          id: "s23-q1",
          label: "Vehicle and trailer maintenance",
          guidance: "Driving licence checks should be carried out on those driving on behalf of the site.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s23-q1a",
              question: "Is there documentary proof that site vehicles and minibuses have been properly maintained?",
              responseType: "DATE_UPLOAD",
              requiresDocument: true,
              documentType: "OTHER",
            },
            {
              id: "s23-q1b",
              question: "Have all trailers been regularly serviced and inspected?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s23-q2",
          question: "How up to date is the list of those authorised to operate restricted vehicles?",
          guidance: "This process needs to be robust with a way of confirming who has been checked.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s23-q3",
          question: "What controls are in place to ensure the safe movement of vehicles on the site?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s24",
      number: 24,
      title: "Protective equipment (PPE)",
      scope: "EXTENDED",
      items: [
        {
          id: "s24-q1",
          question: "What Personal Protective Equipment (PPE) is provided for maintenance tasks?",
          guidance: "Tasks requiring PPE should be identified by the risk assessment.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s24-q2",
          label: "PPE condition, storage and fit",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s24-q2a",
              question: "Is all PPE in usable condition?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s24-q2b",
              question: "Is PPE stored appropriately when not in use?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s24-q2c",
              question: "Is the PPE suitable and sufficient for the identified risks?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s24-q2d",
              question: "Does the PPE fit its users properly?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s24-q3",
          question: "Have users been properly trained in how to use their PPE?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s25",
      number: 25,
      title: "Trees and grounds management",
      scope: "EXTENDED",
      profileFlag: "hasGrounds",
      items: [
        {
          id: "s25-q1",
          label: "Tree surveys and grounds management procedure",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s25-q1a",
              question: "When was the last tree survey carried out on site?",
              responseType: "DATE_UPLOAD",
              requiresDocument: false,
            },
            {
              id: "s25-q1b",
              question: "Where are tree survey records stored and how are they accessible to trustees?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s25-q1c",
              question: "Are trees maintained so they pose no risk of encroachment on or damage to roads, paths or buildings?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s25-q1d",
              question: "Is there a documented grounds management procedure covering the use of machinery, pesticides and herbicides?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s25-q2",
          label: "Invasive Non-Native Species (INNS)",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s25-q2a",
              question: "Is there any Invasive Non-Native Species (INNS) present on site?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s25-q2b",
              question: "If so, is there a management plan in place for the INNS?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
          ],
        },
        {
          id: "s25-q3",
          label: "Grounds flooding",
          guidance: null,
          responseType: "GROUP",
          requiresDocument: false,
          subQuestions: [
            {
              id: "s25-q3a",
              question: "Are any areas of the grounds prone to localised flooding?",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s25-q3b",
              question: "How is localised flooding managed?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s25-q3c",
              question: "How are visiting groups notified about flood-prone areas before their visit?",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
          ],
        },
      ],
    },

    {
      id: "s26",
      number: 26,
      title: "And finally...",
      scope: "ALL",
      items: [
        {
          id: "s26-q1",
          question: "Are there any other features or practices on site not covered above that should be included in this and future audits?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
      ],
    },

  ],
} as const;

/**
 * Acronyms used in this template:
 * AED     — Automated External Defibrillator
 * AMP     — Asbestos Management Plan
 * COSHH   — Control of Substances Hazardous to Health
 * DSE     — Display Screen Equipment
 * EICR    — Electrical Installation Condition Report
 * FRA     — Fire Risk Assessment
 * INNS    — Invasive Non-Native Species
 * LMP     — Legionella Management Plan
 * LOLER   — Lifting Operations & Lifting Equipment Regulations
 * PAT     — Portable Appliance Testing
 * PEEP    — Personal Emergency Evacuation Plan
 * PPE     — Personal Protective Equipment
 * PUWER   — Provision & Use of Work Equipment Regulations
 * RAMS    — Risk Assessments & Method Statements
 * RIDDOR  — Reporting of Injuries, Diseases and Dangerous Occurrences Regulations
 * SDS     — Safety Data Sheet (formerly MSDS)
 */
