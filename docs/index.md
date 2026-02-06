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
3. [Software Designs](#software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

In busy shared environments like universities, losing personal items—such as keys, electronics, or wallets—is a common and stressful occurrence. Currently, recovery relies on fragmented methods like physical notice boards, verbal inquiries, or unorganized social media posts. This lack of a central system leads to low recovery rates and high frustration.

**FindIT** is a digital solution designed to bridge this gap. It provides a centralized, privacy-first platform where users can report lost or found items through structured questionnaires. By using intelligent matching logic and a "gradual disclosure" communication model, FindIT ensures that items are returned to their rightful owners securely and efficiently, reducing the cognitive burden on both students and campus security.

## Solution Architecture

FindIT is built on a web-based architecture that connects three main entities: the **Loser**, the **Finder**, and the **System Administrator**. 

* **Reporting Layer:** Captures detailed item descriptions.
* **Matching Engine:** A decision-support layer that suggests potential matches based on item attributes.
* **Secure Messaging:** A controlled channel for users to verify ownership without exposing sensitive contact details prematurely.

## Software Designs

The system is designed with a focus on data privacy and user empathy. Key components include:
* **User Personas:** Detailed workflows for stressed "Losers" and helpful "Finders."
* **Database Schema:** Optimized for attribute-based searching and matching.
* **Security protocols:** Implementing visibility controls to prevent fraudulent claims.

## Testing

Testing will focus on:
* **Matching Accuracy:** Ensuring the algorithm correctly identifies similar items while minimizing false positives.
* **Privacy Guardrails:** Verifying that no personal data is exposed during the initial search phase.
* **Usability:** Testing the interface responsiveness under simulated "stressful" user scenarios.

## Conclusion

FindIT aims to transform the lost-and-found experience from a game of chance into a reliable, automated service. Beyond simple matching, the software creates a safer campus environment by providing data-driven insights into common loss areas and ensuring a high success rate for item recovery.

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)
