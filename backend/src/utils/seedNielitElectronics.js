const mongoose = require('mongoose');
const env = require('../config/env');
const NSQFCourse = require('../models/NSQFCourse');

const NIELIT_URL = 'https://www.nielit.in/content/nsqf-electronics';

const realNielitElectronicsCourses = [
  { courseName: 'Internet of Things (IoT) Assistant', qualificationName: 'Internet of Things (IoT) Assistant', nsqfLevel: 3, duration: '300 hours', requiredEducation: 'Open', requiredSkills: ['Digital literacy', 'Basic electronics'], acquiredSkills: ['IoT basics', 'Sensor interfacing', 'Device connectivity'] },
  { courseName: 'Installation & Repair Assistant (Consumer Electronics)', qualificationName: 'Installation & Repair Assistant (Consumer Electronics)', nsqfLevel: 3, duration: '300 hours', requiredEducation: 'Open', requiredSkills: ['Basic tools handling', 'Safety awareness'], acquiredSkills: ['Consumer electronics repair', 'Troubleshooting', 'Assembly checks'] },
  { courseName: 'Product Assembly Assistant (Solar-LED)', qualificationName: 'Product Assembly Assistant (Solar-LED)', nsqfLevel: 3, duration: '300 hours', requiredEducation: 'Open', requiredSkills: ['Manual dexterity', 'Basic electrical safety'], acquiredSkills: ['Solar LED assembly', 'Panel mounting', 'Module testing'] },
  { courseName: 'Embedded Software Engineer', qualificationName: 'Embedded Software Engineer', nsqfLevel: 6, duration: '960 hours', requiredEducation: 'Diploma / degree preferred', requiredSkills: ['C programming', 'Embedded systems'], acquiredSkills: ['Firmware development', 'Debugging', 'System integration'] },
  { courseName: 'Biomedical Equipment Maintenance Assistant', qualificationName: 'Biomedical Equipment Maintenance Assistant', nsqfLevel: 3, duration: '300 hours', requiredEducation: 'Open', requiredSkills: ['Basic electronics', 'Safety practices'], acquiredSkills: ['Equipment maintenance', 'Calibration basics', 'Biomedical device support'] },
  { courseName: 'Embedded System Junior Developer (O-Level Embedded System Design)', qualificationName: 'Embedded System Junior Developer', nsqfLevel: 4, duration: '450 hours', requiredEducation: 'Open', requiredSkills: ['C language', 'Digital electronics basics'], acquiredSkills: ['Embedded design', 'Peripheral interfacing', 'Microcontroller programming'] },
  { courseName: 'Printed Circuit Board Technician', qualificationName: 'Printed Circuit Board Technician', nsqfLevel: 4, duration: '480 hours', requiredEducation: 'Open', requiredSkills: ['Circuit basics', 'Precision work'], acquiredSkills: ['PCB assembly', 'Soldering', 'Testing'] },
  { courseName: 'Assistant Computer Technician', qualificationName: 'Assistant Computer Technician', nsqfLevel: 3, duration: '300 hours', requiredEducation: 'Open', requiredSkills: ['Basic computer operation'], acquiredSkills: ['Hardware support', 'Computer maintenance', 'Diagnostics'] },
  { courseName: 'Computer Hardware Maintenance Technician (O-Level Computer Hardware)', qualificationName: 'Computer Hardware Maintenance Technician', nsqfLevel: 4, duration: '600 hours', requiredEducation: 'Open', requiredSkills: ['PC fundamentals', 'Troubleshooting'], acquiredSkills: ['PC assembly', 'Maintenance', 'Repair support'] },
  { courseName: 'Electric Vehicle Systems Operations & Maintenance (O-Level EV)', qualificationName: 'Electric Vehicle Systems Operations & Maintenance', nsqfLevel: 4, duration: '600 hours', requiredEducation: 'Open', requiredSkills: ['Basic electrical knowledge', 'Safety'], acquiredSkills: ['EV system operations', 'Battery handling', 'Maintenance checks'] },
  { courseName: 'Embedded & SoC Designer', qualificationName: 'Embedded & SoC Designer', nsqfLevel: 5, duration: '600 hours', requiredEducation: 'Diploma / engineering preferred', requiredSkills: ['Digital design', 'Embedded basics'], acquiredSkills: ['SoC design', 'RTL understanding', 'System design'] },
  { courseName: 'CAD Associate Designer', qualificationName: 'CAD Associate Designer', nsqfLevel: 4, duration: '150 hours', requiredEducation: 'Open', requiredSkills: ['Basic drafting'], acquiredSkills: ['CAD design', 'Visualization', 'Design support'] },
  { courseName: '3D Printing: Design and Development Fundamentals', qualificationName: '3D Printing: Design and Development Fundamentals', nsqfLevel: 3, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Digital design basics'], acquiredSkills: ['3D modeling', 'Design fundamentals', 'Prototype basics'] },
  { courseName: 'Introduction to IoT Application Development for Agriculture', qualificationName: 'Introduction to IoT Application Development for Agriculture', nsqfLevel: 3, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['IoT basics'], acquiredSkills: ['Agri-IoT concepts', 'Monitoring', 'Automation'] },
  { courseName: 'Introduction to IoT Application Development for Building Security', qualificationName: 'Introduction to IoT Application Development for Building Security', nsqfLevel: 3, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Security awareness'], acquiredSkills: ['IoT security', 'Monitoring systems', 'Integration'] },
  { courseName: 'Introduction to IoT Application Development for Smart City', qualificationName: 'Introduction to IoT Application Development for Smart City', nsqfLevel: 3, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Smart systems basics'], acquiredSkills: ['City tech awareness', 'IoT deployment', 'System thinking'] },
  { courseName: 'Introduction to Cloud Based Robotics Solutions Development', qualificationName: 'Introduction to Cloud Based Robotics Solutions Development', nsqfLevel: 3, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Programming basics'], acquiredSkills: ['Robotics ideas', 'Cloud interfaces', 'Solution design'] },
  { courseName: 'Fundamentals of Quantum Computing', qualificationName: 'Fundamentals of Quantum Computing', nsqfLevel: 6, duration: '60 hours', requiredEducation: 'Diploma / degree preferred', requiredSkills: ['Math fundamentals'], acquiredSkills: ['Quantum concepts', 'Algorithms awareness', 'Computing basics'] },
  { courseName: 'Fundamentals of Embedded C programming', qualificationName: 'Fundamentals of Embedded C programming', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Basic C programming'], acquiredSkills: ['Embedded programming', 'Control logic', 'Code debugging'] },
  { courseName: 'Fundamentals of Microcontroller architecture (ARM), programming and interfacing', qualificationName: 'Fundamentals of Microcontroller architecture (ARM), programming and interfacing', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Basic electronics'], acquiredSkills: ['ARM architecture', 'Peripheral interfacing', 'Program design'] },
  { courseName: 'Fundamentals of sensing and actuation in Embedded Systems', qualificationName: 'Fundamentals of sensing and actuation in Embedded Systems', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['System basics'], acquiredSkills: ['Sensor use', 'Actuator control', 'Embedded system design'] },
  { courseName: 'Basics of Embedded Linux Internals', qualificationName: 'Basics of Embedded Linux Internals', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Linux basics'], acquiredSkills: ['Kernel awareness', 'Device drivers', 'System architecture'] },
  { courseName: 'Essentials of Real Time Operating Systems for Embedded Application', qualificationName: 'Essentials of Real Time Operating Systems for Embedded Application', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Embedded basics'], acquiredSkills: ['RTOS concepts', 'Task scheduling', 'Resource management'] },
  { courseName: 'Fundamentals of Wireless Sensor networks', qualificationName: 'Fundamentals of Wireless Sensor networks', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Networking basics'], acquiredSkills: ['Wireless sensor design', 'Network communication', 'Monitoring'] },
  { courseName: 'Fundamentals of Linux Device Driver Development', qualificationName: 'Fundamentals of Linux Device Driver Development', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Linux & C basics'], acquiredSkills: ['Driver development', 'Kernel interfacing', 'Debugging'] },
  { courseName: 'Essentials of IoT Application Development', qualificationName: 'Essentials of IoT Application Development', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Programming basics'], acquiredSkills: ['Full IoT stack', 'Cloud services', 'App development'] },
  { courseName: 'Essentials of Scripting language for embedded applications', qualificationName: 'Essentials of Scripting language for embedded applications', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Programming basics'], acquiredSkills: ['Python scripting', 'Automation', 'Embedded support'] },
  { courseName: 'Fundamentals of Embedded Product Design', qualificationName: 'Fundamentals of Embedded Product Design', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Product design basics'], acquiredSkills: ['Design thinking', 'Firmware design', 'Testing'] },
  { courseName: 'Essentials of AI for Embedded Application', qualificationName: 'Essentials of AI for Embedded Application', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Python basics', 'Embedded logic'], acquiredSkills: ['Edge AI', 'Model deployment', 'Inference'] },
  { courseName: 'Essentials of Embedded System for Automotive Electronics', qualificationName: 'Essentials of Embedded System for Automotive Electronics', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Electronics basics'], acquiredSkills: ['Automotive electronics', 'ECU awareness', 'Diagnostics'] },
  { courseName: 'Essentials of Embedded System for Medical Electronics', qualificationName: 'Essentials of Embedded System for Medical Electronics', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Electronics basics'], acquiredSkills: ['Medical instrumentation', 'Safety', 'System reliability'] },
  { courseName: 'Essentials of Embedded Security', qualificationName: 'Essentials of Embedded Security', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Embedded basics'], acquiredSkills: ['Firmware security', 'Threat awareness', 'Secure design'] },
  { courseName: 'Fundamentals of VLSI Design', qualificationName: 'Fundamentals of VLSI Design', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Digital electronics basics'], acquiredSkills: ['VLSI concepts', 'Circuit design', 'Verification basics'] },
  { courseName: 'Essentials of RTL Coding for Synthesis', qualificationName: 'Essentials of RTL Coding for Synthesis', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Digital logic'], acquiredSkills: ['RTL coding', 'Synthesis', 'Hardware descriptions'] },
  { courseName: 'Essentials of VLSI circuits timing analysis', qualificationName: 'Essentials of VLSI circuits timing analysis', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Circuit basics'], acquiredSkills: ['Timing analysis', 'Timing closure', 'Verification'] },
  { courseName: 'Fundamentals of FPGA Architecture and programming', qualificationName: 'Fundamentals of FPGA Architecture and programming', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Logic design basics'], acquiredSkills: ['FPGA programming', 'Testing', 'Prototype design'] },
  { courseName: 'Fundamentals of VLSI Verification', qualificationName: 'Fundamentals of VLSI Verification', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Digital design basics'], acquiredSkills: ['Verification methods', 'Testbench design', 'Validation'] },
  { courseName: 'Essentials of System Verilog and UVM based Verification', qualificationName: 'Essentials of System Verilog and UVM based Verification', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['HDL basics'], acquiredSkills: ['System Verilog', 'UVM', 'Verification flow'] },
  { courseName: 'Fundamentals of Design for testability for VLSI Circuits', qualificationName: 'Fundamentals of Design for testability for VLSI Circuits', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['VLSI basics'], acquiredSkills: ['DFT concepts', 'Test planning', 'Chip validation'] },
  { courseName: 'Fundamentals of VLSI Physical Design and Verification', qualificationName: 'Fundamentals of VLSI Physical Design and Verification', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Circuit concepts'], acquiredSkills: ['Placement', 'Routing', 'Validation'] },
  { courseName: 'Fundamentals of Analog VLSI Design', qualificationName: 'Fundamentals of Analog VLSI Design', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Analog electronics basics'], acquiredSkills: ['Analog design', 'Simulation', 'Layout basics'] },
  { courseName: 'Essentials of High-level synthesis programming and Accelerator design', qualificationName: 'Essentials of High-level synthesis programming and Accelerator design', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['C/C++ basics'], acquiredSkills: ['HLS', 'Accelerator design', 'Optimization'] },
  { courseName: 'Essentials of Python for RTL Verification', qualificationName: 'Essentials of Python for RTL Verification', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Python basics'], acquiredSkills: ['RTL automation', 'Verification scripting', 'Testing'] },
  { courseName: 'Essentials of SoC Design for Verification', qualificationName: 'Essentials of SoC Design for Verification', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['SoC basics'], acquiredSkills: ['SoC architecture', 'Verification flow', 'Integration'] },
  { courseName: 'Essentials of Semiconductor Fabrication Technology', qualificationName: 'Essentials of Semiconductor Fabrication Technology', nsqfLevel: 4, duration: '120 hours', requiredEducation: 'Open', requiredSkills: ['Physics basics'], acquiredSkills: ['Semiconductor processes', 'Fabrication steps', 'Quality control'] },
  { courseName: 'Fundamentals of Process Technology and Integration in Semiconductor Fabrication', qualificationName: 'Fundamentals of Process Technology and Integration in Semiconductor Fabrication', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Basic science'], acquiredSkills: ['Process integration', 'Semiconductor flows', 'Materials handling'] },
  { courseName: 'Fundamentals of Cleanroom Operations and Safety', qualificationName: 'Fundamentals of Cleanroom Operations and Safety', nsqfLevel: 4, duration: '30 hours', requiredEducation: 'Open', requiredSkills: ['Safety awareness'], acquiredSkills: ['Cleanroom procedures', 'Safety', 'Contamination control'] },
  { courseName: 'Fundamentals of Photolithography and Mask Making', qualificationName: 'Fundamentals of Photolithography and Mask Making', nsqfLevel: 4, duration: '120 hours', requiredEducation: 'Open', requiredSkills: ['Physics basics'], acquiredSkills: ['Photolithography', 'Mask design', 'Fabrication'] },
  { courseName: 'Fundamentals of Etching Techniques', qualificationName: 'Fundamentals of Etching Techniques', nsqfLevel: 4, duration: '30 hours', requiredEducation: 'Open', requiredSkills: ['Lab safety basics'], acquiredSkills: ['Etching', 'Material removal', 'Process control'] },
  { courseName: 'Fundamentals of Thin Film Technology', qualificationName: 'Fundamentals of Thin Film Technology', nsqfLevel: 4, duration: '30 hours', requiredEducation: 'Open', requiredSkills: ['Material basics'], acquiredSkills: ['Thin film coating', 'Deposition', 'Quality checks'] },
  { courseName: 'Essentials of Device Characterization and Testing', qualificationName: 'Essentials of Device Characterization and Testing', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Electronics basics'], acquiredSkills: ['Device testing', 'Characterization', 'Quality assurance'] },
  { courseName: 'Essentials of Process Equipment Maintenance and Troubleshooting', qualificationName: 'Essentials of Process Equipment Maintenance and Troubleshooting', nsqfLevel: 4, duration: '90 hours', requiredEducation: 'Open', requiredSkills: ['Basic maintenance'], acquiredSkills: ['Equipment upkeep', 'Troubleshooting', 'Process support'] },
  { courseName: 'Fundamentals of Design for Manufacturability (DFM)', qualificationName: 'Fundamentals of Design for Manufacturability (DFM)', nsqfLevel: 4, duration: '30 hours', requiredEducation: 'Open', requiredSkills: ['Design basics'], acquiredSkills: ['DFM', 'Production awareness', 'Optimization'] },
  { courseName: 'Essentials of Semiconductors Assembly Test Marking and Packaging', qualificationName: 'Essentials of Semiconductors Assembly Test Marking and Packaging', nsqfLevel: 4, duration: '180 hours', requiredEducation: 'Open', requiredSkills: ['Manufacturing basics'], acquiredSkills: ['Packaging', 'Testing', 'Assembly processes'] },
  { courseName: 'Essentials of Supply Chain and Materials Management for Semiconductor Fab', qualificationName: 'Essentials of Supply Chain and Materials Management for Semiconductor Fab', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Inventory basics'], acquiredSkills: ['Materials planning', 'Supply chain', 'Procurement'] },
  { courseName: 'Essentials of Automation and Process Control in Semiconductor Manufacturing', qualificationName: 'Essentials of Automation and Process Control in Semiconductor Manufacturing', nsqfLevel: 4, duration: '90 hours', requiredEducation: 'Open', requiredSkills: ['Process basics'], acquiredSkills: ['Automation', 'Control systems', 'Process optimization'] },
  { courseName: 'Essentials of Semiconductor Production and Quality', qualificationName: 'Essentials of Semiconductor Production and Quality', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Quality awareness'], acquiredSkills: ['Process quality', 'Inspection', 'Documentation'] },
  { courseName: 'Essentials of New Product Introduction (NPI) in Semiconductor Manufacturing', qualificationName: 'Essentials of New Product Introduction (NPI) in Semiconductor Manufacturing', nsqfLevel: 4, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Production basics'], acquiredSkills: ['NPI process', 'Launch support', 'Cross-functional awareness'] },
  { courseName: 'Essentials of Optical Fiber Communication', qualificationName: 'Essentials of Optical Fiber Communication', nsqfLevel: 5, duration: '120 hours', requiredEducation: 'Open', requiredSkills: ['Communication basics'], acquiredSkills: ['Fiber optics', 'Signal transmission', 'Networking'] },
  { courseName: 'Fundamentals of Internet of Things', qualificationName: 'Fundamentals of Internet of Things', nsqfLevel: 4, duration: '90 hours', requiredEducation: 'Open', requiredSkills: ['IoT basics'], acquiredSkills: ['Connected devices', 'Programming', 'Monitoring'] },
  { courseName: 'Operation of Cloud Based Industry Robotic Arm', qualificationName: 'Operation of Cloud Based Industry Robotic Arm', nsqfLevel: 3, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Basic robotics'], acquiredSkills: ['Robotic arm handling', 'Cloud control', 'Operations'] },
  { courseName: 'Fundamentals of MATLAB Programming for Digital Signal Processing', qualificationName: 'Fundamentals of MATLAB Programming for Digital Signal Processing', nsqfLevel: 4, duration: '90 hours', requiredEducation: 'Open', requiredSkills: ['Math basics'], acquiredSkills: ['MATLAB', 'Signal processing', 'Analysis'] },
  { courseName: 'Foundation in Embedded Systems for Programmable System-On-Chip (PSOC)', qualificationName: 'Foundation in Embedded Systems for Programmable System-On-Chip (PSOC)', nsqfLevel: 4, duration: '45 hours', requiredEducation: 'Open', requiredSkills: ['C basics'], acquiredSkills: ['PSOC design', 'Embedded control', 'Prototype development'] },
  { courseName: 'Embedded System with IoT', qualificationName: 'Embedded System with IoT', nsqfLevel: 5, duration: '60 hours', requiredEducation: 'Open', requiredSkills: ['Embedded basics'], acquiredSkills: ['Connected embedded systems', 'Sensor integration', 'Control logic'] },
  { courseName: 'Automotive Electronics using Multicore Hardware Platform', qualificationName: 'Automotive Electronics using Multicore Hardware Platform', nsqfLevel: 6, duration: '120 hours', requiredEducation: 'Open', requiredSkills: ['Electronics basics'], acquiredSkills: ['Automotive embedded systems', 'Multicore architecture', 'Testing'] },
  { courseName: 'RTOS for Embedded & Automotive Applications', qualificationName: 'RTOS for Embedded & Automotive Applications', nsqfLevel: 6, duration: '120 hours', requiredEducation: 'Open', requiredSkills: ['Embedded programming basics'], acquiredSkills: ['RTOS design', 'Safety', 'Embedded control'] },
  { courseName: 'Embedded Programmable System-On-Chip (PSOC) for Beginners', qualificationName: 'Embedded Programmable System-On-Chip (PSOC) for Beginners', nsqfLevel: 3, duration: '7.5 hours', requiredEducation: 'Open', requiredSkills: ['Basic electronics'], acquiredSkills: ['PSOC basics', 'Embedded experimentation', 'Prototype learning'] },
  { courseName: 'Automotive Electronics Fundamentals', qualificationName: 'Automotive Electronics Fundamentals', nsqfLevel: 3, duration: '7.5 hours', requiredEducation: 'Open', requiredSkills: ['Basic electronics'], acquiredSkills: ['Auto electronics', 'Diagnostics', 'Safety basics'] },
];

const normalizeCourse = (course) => {
  const level = Number(course.nsqfLevel ?? 0);
  const safeLevel = Number.isFinite(level) && level > 0 && level <= 10 ? level : 3;

  return {
    courseName: course.courseName,
    qualificationName: course.qualificationName || course.courseName,
    nsqfLevel: safeLevel,
    sector: 'Electronics',
    jobRoles: Array.isArray(course.jobRoles) && course.jobRoles.length ? course.jobRoles : [course.courseName],
    requiredEducation: course.requiredEducation || 'Open / as per NSQF eligibility',
    requiredSkills: Array.isArray(course.requiredSkills) && course.requiredSkills.length ? course.requiredSkills : ['Electronics fundamentals'],
    acquiredSkills: Array.isArray(course.acquiredSkills) && course.acquiredSkills.length ? course.acquiredSkills : ['Electronics assembly', 'Troubleshooting'],
    duration: course.duration || 'N/A',
  };
};

const normalizeText = (value) => value
  .replace(/&amp;/gi, '&')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&#39;|&#x27;|&apos;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase()
  .replace(/[’‘]/g, "'")
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const parseNielitRows = (html) => {
  const rows = [];
  const rowMatches = html.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];

  for (const row of rowMatches) {
    const cells = [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((match) => normalizeText(match[1]));
    if (cells.length >= 4) rows.push(cells);
  }

  return rows;
};

const parseLevel = (cells) => {
  const levelCell = cells.find((cell) => /^\d+(?:\.\d+)?$/.test(cell) && Number(cell) >= 1 && Number(cell) <= 10);
  return levelCell ? Number(levelCell) : null;
};

const parseHours = (cells) => {
  const hoursCell = cells.find((cell) => /^\d+(?:\.\d+)?$/.test(cell) && Number(cell) > 10);
  return hoursCell ? `${hoursCell} hours` : null;
};

const fetchNielitElectronicsData = async () => {
  try {
    const response = await fetch(NIELIT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rows = parseNielitRows(await response.text());
    let matchedCount = 0;
    const parsedCourses = realNielitElectronicsCourses.map((course) => {
      const expectedName = normalizeText(course.courseName);
      const row = rows.find((cells) => cells.some((cell) => (
        cell === expectedName || cell.includes(expectedName) || expectedName.includes(cell)
      )));

      if (!row) return normalizeCourse(course);
      matchedCount += 1;

      return normalizeCourse({
        ...course,
        duration: parseHours(row) ?? course.duration,
      });
    });

    if (rows.length === 0 || matchedCount === 0) {
      throw new Error('NIELIT course table could not be parsed');
    }

    console.log(`Parsed ${matchedCount} NIELIT course rows from the live page.`);
    return parsedCourses;
  } catch (error) {
    console.warn('NIELIT fetch failed, using official-source fallback dataset:', error.message);
    return realNielitElectronicsCourses.map(normalizeCourse);
  }
};

const seedNielitElectronics = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    const courses = await fetchNielitElectronicsData();

    await NSQFCourse.deleteMany({ sector: 'Electronics' });
    const inserted = await NSQFCourse.insertMany(courses);

    console.log(`Inserted ${inserted.length} NIELIT Electronics NSQF course records.`);
    console.log('Source:', NIELIT_URL);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed NIELIT Electronics dataset:', error);
    process.exit(1);
  }
};

seedNielitElectronics();
