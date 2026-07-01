import type {
  AuditTemplateItem,
  AuditTemplateSection,
  AuditTemplateSections,
  AuditSectionScope,
} from "@/types/audit-template";

function item(
  id: string,
  question: string,
  guidance: string,
  tags: string[] = [],
  responseType: AuditTemplateItem["responseType"] = "yes_no_na_action",
): AuditTemplateItem {
  return { id, question, guidance, responseType, tags };
}

function section(
  number: number,
  id: string,
  title: string,
  scope: AuditSectionScope,
  items: AuditTemplateItem[],
): AuditTemplateSection {
  return { number, id, title, scope, items };
}

/**
 * Safe Scouting Premises Audit Tool — September 2025.
 * Section titles from Scout Association Appendix A; 4 items per section (100 total).
 */
export const auditTemplate202509: AuditTemplateSections = [
  section(1, "organisation-safety", "Organisation of safety and management", "all", [
    item(
      "org-1",
      "Is there a designated premises manager with documented responsibilities?",
      "A named volunteer should be responsible for day-to-day premises safety and maintenance.",
      ["governance"],
    ),
    item(
      "org-2",
      "Does the Group Executive (trustee board) receive regular premises compliance updates?",
      "Trustees should review compliance at least annually — ideally each meeting.",
      ["governance"],
    ),
    item(
      "org-3",
      "Is there a current premises management plan or maintenance schedule?",
      "A simple plan covering inspections, servicing, and contractor arrangements is sufficient.",
      ["governance"],
    ),
    item(
      "org-4",
      "Are premises insurance documents current and stored securely?",
      "Verify buildings, contents, and public liability cover with the Group treasurer.",
      ["governance", "insurance"],
    ),
  ]),
  section(2, "monitoring-incidents", "Monitoring and Incident Reporting", "all", [
    item(
      "mon-1",
      "Is there a system for recording accidents, incidents, and near-misses?",
      "An accident book or digital log should be maintained and reviewed.",
      ["incidents"],
    ),
    item(
      "mon-2",
      "Are RIDDOR-reportable incidents identified and reported where required?",
      "Serious injuries and dangerous occurrences must be reported to HSE.",
      ["incidents"],
    ),
    item(
      "mon-3",
      "Are incident records reviewed and actions followed up?",
      "Trustees or the premises manager should review trends periodically.",
      ["incidents"],
    ),
    item(
      "mon-4",
      "Is there a process for reporting safeguarding concerns?",
      "Yellow Card procedures and local safeguarding contacts should be known to all leaders.",
      ["incidents", "safeguarding"],
    ),
  ]),
  section(3, "fire", "Fire", "all", [
    item(
      "fire-1",
      "Is a current fire risk assessment available for the premises?",
      "Required for all non-domestic premises; review annually or after significant changes.",
      ["fire"],
    ),
    item(
      "fire-2",
      "Are fire escape routes clearly marked, lit, and kept unobstructed?",
      "Walk all escape routes during your inspection.",
      ["fire"],
    ),
    item(
      "fire-3",
      "Are fire doors self-closing, undamaged, and not wedged open?",
      "Check closers, seals, and signage on all fire doors.",
      ["fire"],
    ),
    item(
      "fire-4",
      "Is the fire assembly point signed, known to leaders, and accessible?",
      "All section leaders should know the assembly point location.",
      ["fire"],
    ),
  ]),
  section(4, "emergency-procedures", "Emergency Procedures", "all", [
    item(
      "emg-1",
      "Are emergency evacuation procedures documented and displayed?",
      "Procedures should cover fire, gas leak, and other foreseeable emergencies.",
      ["emergency"],
    ),
    item(
      "emg-2",
      "Is a fire evacuation drill carried out at least once per term?",
      "Record the date, participants, and any issues identified.",
      ["emergency", "fire"],
    ),
    item(
      "emg-3",
      "Are emergency contact numbers displayed (999, gas emergency, trustees)?",
      "Contacts should be visible near the main entrance or telephone.",
      ["emergency"],
    ),
    item(
      "emg-4",
      "Do leaders know how to raise the alarm and call the emergency services?",
      "Brief new volunteers as part of premises induction.",
      ["emergency"],
    ),
  ]),
  section(5, "electrical", "Electrical", "all", [
    item(
      "elec-1",
      "Is there a current EICR (Electrical Installation Condition Report)?",
      "Fixed-wire testing is typically required every 5 years.",
      ["electrical", "eicr"],
    ),
    item(
      "elec-2",
      "Is PAT testing up to date for portable appliances?",
      "Check test labels and records for all portable equipment used on site.",
      ["electrical", "pat"],
    ),
    item(
      "elec-3",
      "Are consumer units accessible, labelled, and free from damage?",
      "No storage in front of distribution boards; circuits should be labelled.",
      ["electrical"],
    ),
    item(
      "elec-4",
      "Are extension leads and multi-way adapters used safely?",
      "No daisy-chaining; avoid overloading sockets.",
      ["electrical"],
    ),
  ]),
  section(6, "gas", "Gas", "all", [
    item(
      "gas-1",
      "Is there a current Gas Safe certificate for all gas appliances?",
      "Annual inspection by a Gas Safe registered engineer is required.",
      ["gas", "profile:hasGas"],
    ),
    item(
      "gas-2",
      "Are gas appliances serviced annually with records retained?",
      "Check service records for boilers, heaters, and cookers.",
      ["gas", "profile:hasGas"],
    ),
    item(
      "gas-3",
      "Is the gas emergency shut-off valve accessible and labelled?",
      "All users should know the location of the emergency control valve.",
      ["gas", "profile:hasGas"],
    ),
    item(
      "gas-4",
      "Are ventilation requirements met for all gas appliances?",
      "Check flues, vents, and room ventilation against manufacturer guidance.",
      ["gas", "profile:hasGas"],
    ),
  ]),
  section(7, "asbestos", "Asbestos Management", "all", [
    item(
      "asb-1",
      "Has an asbestos survey been carried out where the building pre-dates 2000?",
      "Required for buildings built before 2000; check the survey report.",
      ["asbestos", "profile:buildingAgeBand"],
    ),
    item(
      "asb-2",
      "Is there an asbestos management plan if asbestos-containing materials are present?",
      "The plan should include monitoring, labelling, and control measures.",
      ["asbestos"],
    ),
    item(
      "asb-3",
      "Are contractors informed of asbestos status before works commence?",
      "Provide the asbestos register to all contractors and maintain records.",
      ["asbestos"],
    ),
    item(
      "asb-4",
      "Are damaged or disturbed asbestos-containing materials reported immediately?",
      "Do not disturb; seek specialist advice and restrict access.",
      ["asbestos"],
    ),
  ]),
  section(8, "water-legionella", "Water Quality (Legionella)", "all", [
    item(
      "leg-1",
      "Is a legionella risk assessment in place for the water system?",
      "Required where stored water or infrequent use creates legionella risk.",
      ["legionella", "water"],
    ),
    item(
      "leg-2",
      "Are little-used outlets flushed weekly?",
      "Run taps and showers in rarely used areas for several minutes.",
      ["legionella", "water"],
    ),
    item(
      "leg-3",
      "Are hot and cold water temperatures checked monthly?",
      "Hot water should reach 50°C+ at outlets; cold below 20°C after flushing.",
      ["legionella", "water"],
    ),
    item(
      "leg-4",
      "Is showerhead descaling carried out quarterly?",
      "Descale and clean showerheads to reduce legionella risk.",
      ["legionella", "water"],
    ),
  ]),
  section(9, "third-parties", "Use by Third Parties", "all", [
    item(
      "tp-1",
      "Are hire agreements in place for third-party users of the premises?",
      "Agreements should cover liability, safeguarding, and permitted activities.",
      ["third_parties", "profile:hasThirdPartyUsers"],
    ),
    item(
      "tp-2",
      "Are third-party users given a premises induction covering safety and emergencies?",
      "Include fire exits, assembly point, and any site rules.",
      ["third_parties", "profile:hasThirdPartyUsers"],
    ),
    item(
      "tp-3",
      "Is insurance adequate for third-party hire activities?",
      "Confirm with insurers that hire use is covered.",
      ["third_parties", "insurance"],
    ),
    item(
      "tp-4",
      "Are safeguarding arrangements in place when young people may be present?",
      "External groups hiring the premises must meet safeguarding requirements.",
      ["third_parties", "safeguarding"],
    ),
  ]),
  section(10, "access", "Access to the Premises", "all", [
    item(
      "acc-1",
      "Are access routes free from trip hazards and well maintained?",
      "Check paths, steps, ramps, and car park surfaces.",
      ["access"],
    ),
    item(
      "acc-2",
      "Is disabled access provided where reasonably practicable?",
      "Consider ramps, door widths, toilet facilities, and parking.",
      ["access"],
    ),
    item(
      "acc-3",
      "Are handrails provided and secure on stairs and ramps?",
      "Check fixings, height, and continuity of handrails.",
      ["access"],
    ),
    item(
      "acc-4",
      "Is emergency egress available from all occupied areas?",
      "No dead ends without an alternative escape route.",
      ["access", "fire"],
    ),
  ]),
  section(11, "coshh", "Chemicals and Hazardous Substances (COSHH)", "all", [
    item(
      "coshh-1",
      "Are COSHH assessments available for cleaning chemicals and hazardous substances?",
      "Safety data sheets should be accessible on site.",
      ["coshh"],
    ),
    item(
      "coshh-2",
      "Are hazardous substances stored securely in original labelled containers?",
      "No decanting into unlabelled containers.",
      ["coshh"],
    ),
    item(
      "coshh-3",
      "Is appropriate PPE available where required by COSHH assessments?",
      "Gloves, goggles, and other PPE as specified on safety data sheets.",
      ["coshh", "ppe"],
    ),
    item(
      "coshh-4",
      "Are spill kits available in chemical storage areas?",
      "Particularly relevant for kitchen and cleaning stores.",
      ["coshh"],
    ),
  ]),
  section(12, "equipment", "Equipment", "all", [
    item(
      "equip-1",
      "Is equipment maintained in a safe condition and fit for purpose?",
      "Regular visual checks; repair or remove defective items.",
      ["equipment"],
    ),
    item(
      "equip-2",
      "Are ladders and access equipment inspected and used safely?",
      "Check condition, ratings, and that users are competent.",
      ["equipment"],
    ),
    item(
      "equip-3",
      "Is activity equipment (e.g. pioneering, climbing) inspected before use?",
      "Follow activity-specific guidance and manufacturer instructions.",
      ["equipment"],
    ),
    item(
      "equip-4",
      "Is a defect reporting process in place for equipment?",
      "Faulty equipment should be tagged out of use until repaired.",
      ["equipment"],
    ),
  ]),
  section(13, "flood-risk", "Flood Risk Assessment", "all", [
    item(
      "fld-1",
      "Has a flood risk assessment been completed for the premises?",
      "Required where the site is in a flood risk zone.",
      ["flood", "profile:floodRiskZone"],
    ),
    item(
      "fld-2",
      "Are flood resilience measures in place where required?",
      "Flood gates, raised electrics, sandbag stores as appropriate.",
      ["flood", "profile:floodRiskZone"],
    ),
    item(
      "fld-3",
      "Is there a flood emergency plan with evacuation triggers?",
      "Include contact numbers and actions when flooding is forecast.",
      ["flood"],
    ),
    item(
      "fld-4",
      "Are drains and gullies maintained to reduce surface water flooding?",
      "Clear blockages before winter months.",
      ["flood"],
    ),
  ]),
  section(14, "staff-volunteers", "Staff and Volunteers", "extended", [
    item(
      "sv-1",
      "Are volunteer roles and responsibilities for premises work documented?",
      "Clarify who does maintenance, inspections, and contractor liaison.",
      ["staff"],
    ),
    item(
      "sv-2",
      "Are volunteers given premises safety induction before working on site?",
      "Cover emergencies, hazards, and reporting procedures.",
      ["staff"],
    ),
    item(
      "sv-3",
      "Is lone working managed safely for premises volunteers?",
      "Check-in arrangements for out-of-hours work.",
      ["staff", "lone_working"],
    ),
    item(
      "sv-4",
      "Are relevant training records maintained for premises volunteers?",
      "e.g. first aid, manual handling, equipment use.",
      ["staff"],
    ),
  ]),
  section(15, "guests-visitors", "Guests and Visitors", "extended", [
    item(
      "gv-1",
      "Are visitor and guest procedures documented?",
      "Include signing in, supervision, and emergency arrangements.",
      ["guests", "profile:hasThirdPartyUsers"],
    ),
    item(
      "gv-2",
      "Is supervision adequate when young people and visitors share the premises?",
      "Consider ratios and layout for mixed use.",
      ["guests", "safeguarding"],
    ),
    item(
      "gv-3",
      "Are sleeping accommodation arrangements safe for guests?",
      "Fire detection, evacuation, and safeguarding for overnight stays.",
      ["guests", "profile:hasSleeping"],
    ),
    item(
      "gv-4",
      "Are personal emergency evacuation plans (PEEPs) in place where needed?",
      "Required for individuals who may need assistance to evacuate.",
      ["guests", "profile:hasSleeping", "fire"],
    ),
  ]),
  section(16, "first-aid", "First Aid", "extended", [
    item(
      "fa-1",
      "Are first aid kits stocked, accessible, and checked regularly?",
      "Replace used items; check against a contents checklist.",
      ["first_aid"],
    ),
    item(
      "fa-2",
      "Is there a documented first aid needs assessment?",
      "Consider occupancy, activities, and remoteness from medical help.",
      ["first_aid"],
    ),
    item(
      "fa-3",
      "Are sufficient trained first aiders available during activities?",
      "At least one first aider should be present during section meetings.",
      ["first_aid"],
    ),
    item(
      "fa-4",
      "Is an accident book maintained and reviewed by trustees?",
      "Record all incidents; review trends at executive meetings.",
      ["first_aid", "incidents"],
    ),
  ]),
  section(17, "contractor-management", "Contractor Management", "extended", [
    item(
      "con-1",
      "Is contractor insurance verified before work commences?",
      "Public liability insurance minimum £5m is recommended.",
      ["contractors", "profile:hasThirdPartyUsers"],
    ),
    item(
      "con-2",
      "Are hot work permits used where welding or cutting takes place?",
      "Control ignition sources during maintenance works.",
      ["contractors"],
    ),
    item(
      "con-3",
      "Are contractors briefed on site hazards and emergency procedures?",
      "Include asbestos status, isolation points, and fire exits.",
      ["contractors"],
    ),
    item(
      "con-4",
      "Is contractor work inspected and signed off on completion?",
      "Retain certificates and completion records.",
      ["contractors"],
    ),
  ]),
  section(18, "safeguarding", "Safeguarding", "all", [
    item(
      "sg-1",
      "Are safeguarding policies displayed and accessible on site?",
      "Yellow Card and safeguarding contacts should be visible.",
      ["safeguarding"],
    ),
    item(
      "sg-2",
      "Are changing and toilet facilities appropriate for the age groups using the premises?",
      "Consider layout, supervision, and privacy.",
      ["safeguarding"],
    ),
    item(
      "sg-3",
      "Is the premises layout conducive to good safeguarding practice?",
      "Avoid isolated areas without oversight or CCTV where justified.",
      ["safeguarding"],
    ),
    item(
      "sg-4",
      "Are external hirers vetted for safeguarding compliance?",
      "Applies when third parties use the premises.",
      ["safeguarding", "profile:hasThirdPartyUsers"],
    ),
  ]),
  section(19, "manual-handling", "Manual Handling", "extended", [
    item(
      "mh-1",
      "Have manual handling risks been assessed for routine premises tasks?",
      "Consider furniture moves, deliveries, and maintenance activities.",
      ["manual_handling"],
    ),
    item(
      "mh-2",
      "Is handling equipment (trolleys, sack trucks) available where needed?",
      "Reduce lifting where reasonably practicable.",
      ["manual_handling"],
    ),
    item(
      "mh-3",
      "Are volunteers briefed on safe lifting techniques?",
      "Keep loads manageable; work in pairs for heavy items.",
      ["manual_handling"],
    ),
    item(
      "mh-4",
      "Are storage arrangements organised to minimise awkward lifting?",
      "Heavy items stored at waist height where possible.",
      ["manual_handling"],
    ),
  ]),
  section(20, "catering", "Catering", "extended", [
    item(
      "cat-1",
      "Is food hygiene training current for those preparing food on site?",
      "Level 2 Food Safety certificate is recommended for food handlers.",
      ["catering", "profile:hasCateringKitchen"],
    ),
    item(
      "cat-2",
      "Are kitchen surfaces, equipment, and storage hygienic?",
      "Check cleanliness, fridge temperatures, and pest control.",
      ["catering", "profile:hasCateringKitchen"],
    ),
    item(
      "cat-3",
      "Is extraction and ventilation adequate in the kitchen?",
      "Canopy and filters should be cleaned regularly.",
      ["catering", "profile:hasCateringKitchen"],
    ),
    item(
      "cat-4",
      "Are allergen controls in place when catering for groups?",
      "Display allergen information and prevent cross-contamination.",
      ["catering", "profile:hasCateringKitchen"],
    ),
  ]),
  section(21, "sleeping-accommodation", "Sleeping Accommodation", "extended", [
    item(
      "slp-1",
      "Are sleeping areas provided with adequate fire detection?",
      "Mains-wired smoke alarms with battery backup are preferred.",
      ["sleeping", "profile:hasSleeping", "fire"],
    ),
    item(
      "slp-2",
      "Is a night-time evacuation plan documented and practised?",
      "Include roles for waking young people and accounting for all occupants.",
      ["sleeping", "profile:hasSleeping", "emergency"],
    ),
    item(
      "slp-3",
      "Are portable heaters prohibited in sleeping areas?",
      "Fixed heating only in sleeping accommodation.",
      ["sleeping", "profile:hasSleeping", "fire"],
    ),
    item(
      "slp-4",
      "Are sleeping areas segregated appropriately for safeguarding?",
      "Separate facilities for different groups as required by policy.",
      ["sleeping", "profile:hasSleeping", "safeguarding"],
    ),
  ]),
  section(22, "plant-machinery", "Plant, Machinery, and Tools", "extended", [
    item(
      "plt-1",
      "Are risk assessments in place for plant and machinery on site?",
      "Include training requirements and safe systems of work.",
      ["plant", "profile:hasPlantMachinery"],
    ),
    item(
      "plt-2",
      "Are guards and safety devices in place and functional?",
      "Do not operate machinery with guards removed.",
      ["plant", "profile:hasPlantMachinery"],
    ),
    item(
      "plt-3",
      "Is maintenance and inspection documented for plant and machinery?",
      "LOLER checks where applicable for lifting equipment.",
      ["plant", "profile:hasPlantMachinery"],
    ),
    item(
      "plt-4",
      "Are only competent persons authorised to use plant and machinery?",
      "Training records should be retained.",
      ["plant", "profile:hasPlantMachinery"],
    ),
  ]),
  section(23, "vehicles", "Vehicles", "extended", [
    item(
      "veh-1",
      "Is vehicle storage segregated from pedestrian routes?",
      "Minimise interaction between vehicles and young people.",
      ["vehicles", "profile:hasVehicles"],
    ),
    item(
      "veh-2",
      "Are fuel and oil stored safely with spill containment?",
      "Use appropriate containers and bunding.",
      ["vehicles", "profile:hasVehicles"],
    ),
    item(
      "veh-3",
      "Are minibus and trailer checks documented if applicable?",
      "Daily walk-around checks and MOT/service records.",
      ["vehicles", "profile:hasVehicles"],
    ),
    item(
      "veh-4",
      "Are vehicle movements managed safely during Scout activities?",
      "Designate parking, reversing areas, and speed limits on site.",
      ["vehicles", "profile:hasVehicles"],
    ),
  ]),
  section(24, "ppe", "Protective Equipment (PPE)", "extended", [
    item(
      "ppe-1",
      "Is required PPE available, maintained, and used correctly?",
      "Hard hats, gloves, eye protection as identified by risk assessments.",
      ["ppe"],
    ),
    item(
      "ppe-2",
      "Are PPE requirements communicated to volunteers and contractors?",
      "Include in induction and method statements.",
      ["ppe"],
    ),
    item(
      "ppe-3",
      "Is PPE stored cleanly and checked before use?",
      "Replace damaged or expired PPE promptly.",
      ["ppe"],
    ),
    item(
      "ppe-4",
      "Is a register maintained for issued PPE where required?",
      "Track issue and replacement for higher-risk activities.",
      ["ppe"],
    ),
  ]),
  section(25, "trees-grounds", "Trees and Grounds", "extended", [
    item(
      "grd-1",
      "Are trees inspected regularly by a competent person?",
      "Annual inspection recommended; more frequent after storms.",
      ["grounds", "profile:hasGrounds"],
    ),
    item(
      "grd-2",
      "Are paths, play areas, and car parks maintained safely?",
      "Check for potholes, uneven surfaces, and debris.",
      ["grounds", "profile:hasGrounds"],
    ),
    item(
      "grd-3",
      "Is vegetation managed to reduce fire and trip hazards?",
      "Clear overgrowth from paths and building perimeters.",
      ["grounds", "profile:hasGrounds"],
    ),
    item(
      "grd-4",
      "Are external waste storage areas secure and away from fire routes?",
      "Bins should not obstruct escape routes.",
      ["grounds", "profile:hasGrounds"],
    ),
  ]),
];
