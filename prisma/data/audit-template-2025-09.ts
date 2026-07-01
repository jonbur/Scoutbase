/**
 * Audit Template Seed — Scout Association Safe Scouting Premises Audit Tool
 * Version: September 2025
 *
 * Use this as the single source of truth for the AuditTemplate.sections JSON.
 * Run as a Prisma seed: `npx prisma db seed`
 *
 * ResponseType values:
 *   YES_NO_NA_ACTION  — standard yes/no/not applicable/action needed (most questions)
 *   OPEN_TEXT         — free-text only (descriptive "how" questions with no binary answer)
 *   DATE_UPLOAD       — prompts for a date + document upload (certificates, reports)
 *
 * profileFlag: if set, this item is only shown when the premises profile has that flag = true.
 *   Possible flags: hasGas, hasSleeping, hasCateringKitchen, hasGrounds, hasVehicles,
 *                   hasPlantMachinery, hasThirdPartyUsers, hasPaidStaff, floodRisk (medium/high)
 *
 * requiresDocument: true = prompts user to upload a certificate/report and enter expiry date.
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
          question: "Is there a management committee appointed for the premises? How often do they report to the relevant trustee board? How are the trustees aware of their responsibilities for the management of the premises?",
          guidance: "Consider responsibilities or consequences for both Actions and In-action.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s1-q2",
          question: "Are the current premises risk assessments suitable and sufficient? How are these shared with team members and users? Are they reviewed regularly (at least annually)?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          guidance: "Make sure these are accessible for future reference and changes in trustees.",
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
          question: "What assessment has been made of the site for those with additional needs? What reasonable adjustments have been put in place to assist needs?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s1-q7",
          question: "Is there a notice board or visible signage on the premises for both visitors and staff/volunteers to see? It may include: Yellow Card (safeguarding procedures), Alcohol & Drug guidance, Gas Safety guidance, Carbon Monoxide poster, Fire Evacuation Procedures, Good Hygiene, Food Hygiene, and other safety information. Are these checked they are current?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s1-q8",
          question: "What guidance and controls are in place for Lone working for volunteers or visitors?",
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
          question: "How are the trustees monitoring that processes are being followed, adequate records are being kept and reviewing incidents?",
          guidance: "See learning review guidance on the Scout website.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s2-q3",
          question: "Do volunteers understand when incidents need to be reported and where to report?",
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
          question: "Is a Fire Risk Assessment in place and completed by a competent person? When was it last reviewed? Who carried it out?",
          guidance: "Outstanding actions identified in the Fire RA should be recorded as actions.",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "FIRE_RA",
        },
        {
          id: "s3-q2",
          question: "Has the Fire Risk Assessment been shared with the Trustees? Is it sufficient?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q3",
          question: "Are fire alarms installed? What type? Are smoke/heat detectors present? How do you raise the alarm? Are call points present? What is the testing and recording regime for these?",
          guidance: "Best practice is to test alarms weekly.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q4",
          question: "Is there sleeping accommodation on site? Is the fire alarm system suitable for sleeping in the building?",
          guidance: "An automated alarm system (L2) should be in place where sleeping accommodation is provided.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "hasSleeping",
        },
        {
          id: "s3-q5",
          question: "Are there any additional measures put in place for sleepovers?",
          guidance: "Where sleeping is not the building's primary purpose, additional temporary measures should be considered.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "hasSleeping",
        },
        {
          id: "s3-q6",
          question: "Are smoke detectors and Carbon monoxide monitors in good working order, covering hazardous zones, and a testing regime in place? What is the testing regime for these?",
          guidance: "Best practice is to test alarms weekly.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q7",
          question: "Are the fire extinguishers in good working order and a servicing regime in place? Are they appropriately fixed and have correct signage?",
          guidance: "A regular walk around and visual check by a team member as well as servicing is a good idea.",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "FIRE_EXTINGUISHER",
        },
        {
          id: "s3-q8",
          question: "Is there safe access and egress? (getting out in a hurry)",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q9",
          question: "Is the Emergency lighting suitable and sufficient? Does it light up all evacuation routes and emergency exits?",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q10",
          question: "Is safety lighting working? Daily — visual indication light is illuminated; Monthly — 1 minute test carried out; Annually — 1 minute test carried out and checking visibility of lighting, signage and fire exit route. Have any remedial actions been completed by a competent person?",
          guidance: null,
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "EMERGENCY_LIGHTING",
        },
        {
          id: "s3-q11",
          question: "If there is no automatic safety lighting, how are users guided to emergency routes?",
          guidance: "Glow in the dark signs? Torches?",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s3-q12",
          question: "When was the last Evacuation drill carried out?",
          guidance: "Sections are advised to practice this each term. Note — all unplanned evacuations/alarms should be recorded.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s3-q13",
          question: "What Personal Emergency Evacuation Plans (PEEPs) need to be in place for those with accessible needs?",
          guidance: "An example PEEP can be found on the Scout website.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q14",
          question: "Is there a register of Fire Doors? How often are they inspected on this site? When was the last inspection carried out — and by whom? What remedial actions have been carried out?",
          guidance: "Fire doors are generally used to protect areas from high risks of fire spread, such as a boiler room door in a corridor used for fire escape.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q15",
          question: "Are door closers used to control the speed/weight of closing?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s3-q16",
          question: "Are door finger guards used to protect hands from the hinged gap?",
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
          question: "Are there documented procedures for the management of foreseeable emergencies? This could include but is not limited to fire, working at heights, working in confined spaces, loss of services or flooding.",
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
          question: "When was your portable appliance testing (PAT) completed? When was your Fixed electrical testing (EICR) completed? Have any remedial works been completed?",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "EICR",
        },
        {
          id: "s5-q2",
          question: "Are electrical boards & cupboards secure? Have they been tested as appropriate?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s5-q3",
          question: "Are wall sockets flush to the wall, screwed in well and with casing in good condition?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s5-q4",
          question: "Is general lighting working? Inside? Outside? Is it suitable and sufficient?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s5-q5",
          question: "Date of annual lightning protection check and certification, where installed.",
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
          question: "Have all Gas appliances been serviced as required? Provide a list of all appliances with check dates.",
          guidance: "Note name of Gas Safe contractor used.",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "GAS_SAFE",
        },
        {
          id: "s6-q2",
          question: "Are there interlocks in place between Cooker, extractors and alarm?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "hasCateringKitchen",
        },
        {
          id: "s6-q3",
          question: "Are Carbon Monoxide monitors / Alarms fitted and checked? If there are fireplaces, have chimneys been swept?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s6-q4",
          question: "When did extraction units / cooker hoods receive annual independent inspection and cleaning?",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
          profileFlag: "hasCateringKitchen",
        },
        {
          id: "s6-q5",
          question: "Is Bulk Gas stored/used on this site? When was it checked for compliance?",
          guidance: "Record who carried out the checks.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s6-q6",
          question: "Is bottled Gas stored on site? How is it stored safely? (e.g. in an exterior gas cage?)",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Has an Asbestos Survey been carried out for the site? If so — what date?",
          guidance: "How is the survey accessible to the trustees?",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "ASBESTOS",
        },
        {
          id: "s7-q2",
          question: "What is the date of the Asbestos Management Plan (AMP)? When was it last reviewed?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s7-q3",
          question: "Have regular inspections of the asbestos been carried out? How are they recorded?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Is there a Legionella Management Plan in place? When was the last Water Quality Risk Assessment done?",
          guidance: "Recommended for more complex water systems (typically every 2 years). Any remedial actions identified in last inspection should be recorded. HSE guidance — ACOP L8 + HSG274.",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "LEGIONELLA",
        },
        {
          id: "s8-q2",
          question: "How are checks and works being carried out as per the Legionella Management Plan (LMP)? Has your check included: Weekly — flushing of taps, showers & standpipes; Monthly — temperature checks; Quarterly — clean and descale shower heads; Annual — checks all outlets?",
          guidance: "There is an Example LMP on the Scout website. Section 6.0 of the LMP will give the full list of possible checks required.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Do other groups or third parties also use the site you operate on?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s9-q2",
          question: "What hazards are naturally occurring that visitors may need to be readily aware of?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s9-q3",
          question: "Are there maintenance tasks being carried out that could affect visitors or others staying into your area of operation?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s9-q4",
          question: "What Scout activities are carried out at the premises that may be a hazard to visitors or others not actively involved? (e.g. pioneering structures, climbing equipment, campfires)",
          guidance: "E.g. pioneering structures are disassembled at the end of the session, climbing equipment is returned to locked storage after session, campfires are doused and checked before leaving the area.",
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
          question: "How is access to the premises controlled? (Pedestrians and Vehicles)",
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
          question: "Is there public access to the site? How is this managed when there is no representative on site?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s10-q4",
          question: "Is CCTV used and how is CCTV managed?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s10-q5",
          question: "What condition are the paths and roads in? What regular checks are made? Are they likely to cause hazard or damage to pedestrians or vehicles? Is there adequate lighting for these?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s10-q6",
          question: "Are there any parts of the site that are derelict or hidden away? Consider physical dangers from these, and unseen spaces for inappropriate behaviour (e.g. drugs, alcohol or safeguarding issues).",
          guidance: "Fencing? Signage? Checks?",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s10-q7",
          question: "Is there disability access to the premises? How often and how is this checked so it is fit for use?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "What chemicals or hazardous substances are in the area?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s11-q2",
          question: "How are they stored in an appropriate manner? What secure place are they stored in?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s11-q3",
          question: "Are Material Data Sheets available? When were they last reviewed?",
          guidance: "Domestic products may have the necessary information on the label.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s11-q4",
          question: "Have COSHH Risk Assessments been produced and made available to staff and users? When were these last reviewed and who by?",
          guidance: "Domestic products may have the necessary information on the label.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Has regular camping and Group type equipment been checked/serviced for safety issues? (e.g. gas or petrol stoves, lamps)",
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
          question: "How is the equipment safely stored?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s12-q4",
          question: "Is there an inventory of all equipment and tools and who maintains the inventory?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s12-q5",
          question: "Has all equipment been regularly serviced and maintained in accordance with manufacturer's recommendations? Do any pieces of equipment require external inspection?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s12-q6",
          question: "Do you have pioneering equipment? Is it in safe condition? Are there safe places to use it?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
      ],
    },

    {
      id: "s13",
      number: 13,
      title: "Flood Risk Assessment",
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
          question: "If your property has medium or higher risk for flooding, do you have a flood risk management plan in place?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "floodRisk",
        },
        {
          id: "s13-q3",
          question: "Is your property insurer aware of the flooding risk of your property?",
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
              guidance: "E.g. This could include part time cleaners or activity staff.",
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
              question: "Have appropriate vetting and disclosure checks been undertaken on those involved at the premises (staff or volunteers)?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q4",
              question: "Are all staff and volunteers involved with the premises appointed, with the role connected to the premises recorded on the National membership system? How is this managed and maintained to keep it up to date?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q5",
              question: "What policies have been put in place for the staff or volunteers? Including: Yellow Card (safeguarding procedures), Code of conduct, Alcohol & Drugs, Use of accommodation areas, Reviews with managers (to share any concerns), Reporting of any issues/concerns (ensuring more than one person is designated), Dress code, Knowing who is on site, Lone working, Health & Safety — including training. Are these policies regularly reviewed and readily available to all?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q6",
              question: "What training and competency checks are provided for staff and volunteers? Including: Safeguarding, Safety, First Aid, GDPR, Specific activity requirements, Specific maintenance tasks. How is training recorded and competency monitored? By whom?",
              guidance: "This may be a useful starting point for training team members, although additional specific training may be required for their role.",
              responseType: "OPEN_TEXT",
              requiresDocument: false,
            },
            {
              id: "s14-q7",
              question: "What induction of safety procedures are in place for staff on taking up a new role? Are these suitable and sufficient?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q8",
              question: "Are staff/volunteers easily recognisable to visitors and each other?",
              guidance: null,
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
            },
            {
              id: "s14-q9",
              question: "How are language barriers managed for vital communications?",
              guidance: "Pictograms can be used to help this.",
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
              question: "What clear boundaries are in place for the staff areas (considerations for their welfare and safeguarding protection)? How is separate accommodation provided for those under 18 attending to support the premises?",
              guidance: "Remember our Safeguarding Code of Practice: Do have separate sleeping accommodation for young people, adults and Young Leaders working with a younger section.",
              responseType: "YES_NO_NA_ACTION",
              requiresDocument: false,
              profileFlag: "hasSleeping",
            },
            {
              id: "s14-q11",
              question: "How are checks on upkeep, welfare and the appropriate behaviour/activity of staff in staff accommodation monitored and managed?",
              guidance: null,
              responseType: "OPEN_TEXT",
              requiresDocument: false,
              profileFlag: "hasSleeping",
            },
          ],
        },
      ],
      items: [], // items stored in subsections
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
          question: "What process is in place for visitors to check out? How do you know they have left the site?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s15-q4",
          question: "Is there a record and agreement in place with users of the premises?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s15-q5",
          question: "How do staff/volunteers observe/report concerns about the following practices by users: alcohol & drugs behaviour, young people's welfare and safeguarding, safe activities & camping, supervision of young people during 'free time', photos — inappropriate taking?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s15-q6",
          question: "How are non-Scout users of the premises made aware of the procedures regarding reporting of incidents or safeguarding concerns? What safeguarding arrangements do they have?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s15-q7",
          question: "Bunk Beds — What guidance is in place to advise users of the risks? Is the ladder fixed to the bed frame? Is there a 760mm gap from the top bunk to the ceiling? Are there any gaps smaller than 60mm or larger than 75mm?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
          profileFlag: "hasSleeping",
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
          question: "Is there adequate first aid cover? What first aid equipment is there? What process is in place to regularly check it?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s16-q2",
          question: "Is there a Defibrillator (AED), Trauma kit, Bleed kit, and/or Anaphylaxis kit on site? What process is in place to regularly check it?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s16-q3",
          question: "How do you dispose of sharp objects and large amounts of medical waste?",
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
          question: "Contractors — how are contractor competencies assessed? Are inductions being carried out sufficiently and recorded? Has the Yellow card been shared? What documentation is in place for this?",
          guidance: "References, Qualifications, Professional memberships etc.",
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s17-q2",
          question: "How are contractors being effectively and safely managed whilst on site?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s17-q3",
          question: "Are Risk Assessments and Method Statements (RAMS) from Contractors suitable and sufficient?",
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
          question: "What areas present a risk of falls from height? (activity, roof, storage, etc.) How is this managed? Are there any below ground and confined spaces?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s18-q2",
          question: "Are there any scaffolding structures on site — long or short term? What inspection regime exists to keep them safe? What protection is in place to stop anyone from climbing on them?",
          guidance: "Regular inspections?",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          guidance: "It is recommended those involved in regular handling activity should have relevant (refresher) training from time to time.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s19-q2",
          question: "How have the local risks from handling (particularly in storage areas) been identified and what suitable controls put in place?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s19-q3",
          question: "Is there suitable and sufficient equipment to help with safe handling?",
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
          question: "What systems are in place for food control? Are these controls in line with relevant regulations for the activities being undertaken?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s20-q2",
          question: "What training has been received by staff in relation to food safety and hygiene?",
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
          question: "Is the area tidy and free of waste? Is there a documented process for the disposal of waste? If there is a concern over vermin, is an appropriate pest control system in place with appropriate records?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Are there any loft hatches? What is the process for using these? How are they secured when not in use to prevent unplanned access?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Have Workstation Assessments been carried out for regular computer users? (where required, including display screen equipment)",
          guidance: "Have remedial actions from these been taken?",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s21-q6",
          question: "What processes are in place for Lone Working or Remote Working?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
        {
          id: "s21-q7",
          question: "Are plans available for the site? Do these show underground and overhead services?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Is racking and storage safe for use? Is it inspected and recorded?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s22-q2",
          question: "Has all equipment been regularly serviced and maintained in accordance with manufacturer's recommendations? Do any pieces of equipment require external inspection? If so is the relevant inspection process in place and up to date (for example LOLER and PUWER)?",
          guidance: "Use stickers to show service dates.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s22-q3",
          question: "Are all Ladders listed on a Ladder Register? How are Ladder inspections managed?",
          guidance: "Mark the ladders with a unique ID to correspond to the register.",
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s22-q4",
          question: "Do you have an activities or playground area? What checking and maintenance plan is in place? Does access to the equipment need to be controlled? How is supervision of users managed?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Is there documentary proof that site vehicles or minibuses have been properly maintained? Have all trailers been regularly serviced and inspected?",
          guidance: "What driving licence checks have been carried out on those driving on behalf of the site?",
          responseType: "DATE_UPLOAD",
          requiresDocument: true,
          documentType: "OTHER",
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
          question: "Is it in usable condition? Is it stored in an appropriate manner? Is it suitable and sufficient? Does the PPE fit the user properly?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s24-q3",
          question: "Have users been properly trained how to use it?",
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
          question: "When was the last survey of trees carried out on site? Where are details of the tree surveys stored? Are the trees in a managed state so as not to encroach on or cause risk to roads, paths and buildings? Is there a documented procedure for all grounds management including use of machinery, pesticides and herbicides?",
          guidance: "Any remedial actions identified in last inspection should be recorded.",
          responseType: "DATE_UPLOAD",
          requiresDocument: false,
        },
        {
          id: "s25-q2",
          question: "Is there any Invasive Non-Native Species (INNS) present on site? Is there a management plan available for the INNS on site?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
        },
        {
          id: "s25-q3",
          question: "Are any areas of the grounds prone to flooding? How is this managed? How are users of the site notified in advance of visiting?",
          guidance: null,
          responseType: "YES_NO_NA_ACTION",
          requiresDocument: false,
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
          question: "Are there any other features or practices on site that are not mentioned above that should be included in this audit and subsequent audits?",
          guidance: null,
          responseType: "OPEN_TEXT",
          requiresDocument: false,
        },
      ],
    },

  ],
} as const;

/**
 * Key terms used in the template:
 * PPE     — Personal Protective Equipment
 * RIDDOR  — Reporting of Injuries, Diseases and Dangerous Occurrences Regulations
 * COSHH   — Control of Substances Hazardous to Health
 * LOLER   — Lifting Operations & Lifting Equipment Regulations
 * PUWER   — Provision & Use of Work Equipment Regulations
 * LMP     — Legionella Management Plan
 * AMP     — Asbestos Management Plan
 * FRA     — Fire Risk Assessment
 * PEEP    — Personal Emergency Evacuation Plan
 * EICR    — Electrical Installation Condition Report
 * PAT     — Portable Appliance Testing
 * RAMS    — Risk Assessments & Method Statements
 * AED     — Automated External Defibrillator
 * INNS    — Invasive Non-Native Species
 */
