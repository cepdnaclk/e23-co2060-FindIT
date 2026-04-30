---
layout: home
permalink: index.html

# Updated with your specific project details
repository-name: e23-co2060-FindIT
title: FindIT - A Smart Lost and Found Management System
---

# FindIT: A Smart Lost and Found Management System

---

## Team
- E/23/431, Dulmina Weerasinghe, [e23431@eng.pdn.ac.lk](mailto:e23431@eng.pdn.ac.lk)
- E/23/149, Livindu Jayasinghe, [e23149@eng.pdn.ac.lk](mailto:e23149@eng.pdn.ac.lk)
- E/23/382, Lihini Silva, [e23382@eng.pdn.ac.lk](mailto:e23382@eng.pdn.ac.lk)
- E/23/274, Thenuk Piyathilake, [e23274@eng.pdn.ac.lk](mailto:e23274@eng.pdn.ac.lk)

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture)
3. [Core Features & Engineering](#core-features--engineering)
4. [Testing & Future Roadmap](#testing--future-roadmap)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

In busy shared environments like universities, losing personal items—such as keys, electronics, or wallets—is a common and stressful occurrence. Currently, recovery relies on fragmented methods like physical notice boards, verbal inquiries, or unorganized social media posts. This lack of a central system leads to low recovery rates and high frustration.

**FindIT** is a digital solution designed to bridge this gap. It provides a centralized, privacy-first platform where users can report lost or found items through structured questionnaires. By using intelligent matching algorithms and a "gradual disclosure" communication model, FindIT ensures that items are returned to their rightful owners securely and efficiently, reducing the cognitive burden on both students and campus administration.

## Solution Architecture

FindIT is built on a modern, decoupled Full-Stack web architecture designed for scalability, speed, and cloud efficiency. 

* **Frontend (Client-Side):** Built with **React**, featuring dynamic report forms, real-time dashboard views, and client-side image compression to reduce bandwidth before data ever leaves the user's device.
* **Backend (API Layer):** A robust **Python FastAPI** service that handles business logic, securely processes incoming reports, and manages asynchronous polling to keep the frontend updated.
* **Database Layer:** Hosted on **Aiven MySQL** cloud infrastructure. To optimize performance and prevent database bloat, the database only stores lightweight data and URL pointers, rather than heavy files.
* **Cloud & Microservices:**
  * **Cloudinary:** A dedicated Content Delivery Network (CDN) used for off-site media management. High-resolution item photos are uploaded directly to the cloud, ensuring lightning-fast load times.
  * **Brevo API:** Utilized for reliable transactional emails and automated notifications via HTTPS, bypassing traditional SMTP host limits.

## Core Features & Engineering

The system is designed with a heavy focus on data privacy, user empathy, and intelligent automation. Key engineering milestones include:

* **Fuzzy Logic Matching Engine:** Instead of relying on unpredictable AI prompts, FindIT utilizes a precise Fuzzy Logic algorithm to pair lost and found reports. This ensures high-accuracy matches even if users make spelling mistakes or use slightly different item descriptions.
* **Secure Handover Protocol:** To prevent fraudulent claims, FindIT employs a "Secret Question" verification layer. A finder will only reveal the item's location or their contact details if the claimant can correctly answer a specific question about the item (e.g., "What is the wallpaper on the phone?").
* **Privacy-First Contact Revelation:** User Personally Identifiable Information (PII), such as phone numbers, is protected using **Fernet Encryption**. Contact details are kept strictly hidden and are only decrypted and revealed once the system mathematically verifies a successful match and handover agreement.

## Testing & Future Roadmap

As the project moves into its final phases (Semester 4), testing and refinement remain our top priority:

* **Unit & Integration Testing:** Automated testing of FastAPI routes and React component states to ensure seamless data flow between the decoupled cloud services.
* **Usability & Acceptance Testing (UAT):** Gathering real customer feedback from pilot groups to refine the UI/UX, ensuring the interface remains highly responsive and intuitive for users operating under the stress of losing an item.
* **Advanced Automation:** Developing "7-day cleanup" logic to automatically prune the database of stale data and implementing push notifications for instant match alerts.

## Conclusion

FindIT aims to transform the lost-and-found experience from a game of chance into a reliable, automated service. By leveraging cloud infrastructure, cryptographic security, and smart matching algorithms, the software creates a safer campus environment and ensures a high success rate for asset recovery.

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)
