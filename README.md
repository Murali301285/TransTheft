# Transformer Guard - Theft Tracking & Monitoring System

Transformer Guard is a comprehensive dashboard application designed to monitor, track, and manage electrical transformers. It provides real-time status updates, theft alerts, and administrative controls for utility companies to safeguard their assets.

## 🚀 Key Features

### 1. **Dashboard Hub**
   - Centralized view of all modules.
   - Quick access to LC Management, Admin Console, Reports, and Alerts.

### 2. **LC Management (Line Controller)**
   - **Real-time Status Grid**: Monitor active/inactive/alert status of transformers.
   - **Interactive Map**: Visualize transformer locations (with Google Maps integration placeholder).
   - **Detail View**: Drill down into specific transformer metrics (Voltage, Oil Level, History).
   - **Neighbor Map**: Analyze nearby sites for proximity coverage and checks.

### 3. **Smart Alert System**
   - Real-time notification of critical events (Voltage Surge, Power Outage).
   - Severity classification (Critical, High, Medium, Low).
   - Workflow to acknowledge and resolve alerts.

### 4. **Reports & Analytics**
   - Generate operational summaries.
   - Export data in PDF, Excel, and CSV formats.
   - Visualize trends in uptime and maintenance.

### 5. **Admin Console**
   - **User Management**: Role-Based Access Control (RBAC).
   - **Asset Management**: CRUD operations for Transformers, SIMs, and Locations.
   - **Bulk Upload**: Import data via Excel templates.

### 6. **Hierarchy View**
   - Visual Organization Tree representing the grid infrastructure (Circle -> Division -> Sub-division).

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript
- **State Management**: React Hooks & Context
- **Icons**: Lucide React
- **Maps**: Modular Component (Readiness for Google/Leaflet)
- **Data Grid**: TanStack Table

## 📦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Murali301285/TransTheft.git
    cd TransTheft
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

- **Environment Variables**: Create a `.env.local` file for API keys (e.g., `NEXT_PUBLIC_GOOGLE_MAPS_KEY`).
- **Mock Data**: Currently uses static mock data for demonstration. Connect to a backend API by updating `src/services/api.ts`.

## 🤝 Contribution

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---
© 2026 TTM. All rights reserved.
