# AthleTrack – Full-Stack Fitness Progress Monitoring Platform

## **Temat Projektu Inżynierskiego:**
### Budowa i wdrożenie webowej platformy do monitorowania postępów treningowych z modułem wizualizacji danych w architekturze full-stack .NET i React.

---

## Opis Projektu
Projekt rozwiązuje problem braku zintegrowanych narzędzi do monitorowania długoterminowych postępów treningowych. System łączy w sobie inteligentny dziennik treningowy, moduł śledzenia parametrów antropometrycznych oraz silnik analityczny, który wizualizuje postępy użytkownika w czasie rzeczywistym.

## Stack Technologiczny

### **Backend (Warstwa Logiki):**
* **Framework:** ASP.NET Core 8/9 Web API (C#)
* **Zarządzanie Użytkownikami:** Microsoft Identity Platform (`IdentityUser<int>`)
* **Bezpieczeństwo:** Autoryzacja tokenami **JWT** (JSON Web Token) z obsługą Claims.
* **Baza Danych:** SQL Server + Entity Framework Core (Code First).
* **Testy:** xUnit, FluentAssertions (16 testów jednostkowych logiki biznesowej).

### **Frontend (Warstwa Prezentacji):**
* **Biblioteka:** React.js (TypeScript)
* **Zarządzanie Stanem:** React Hooks (`useMemo`, `useEffect`) dla optymalizacji obliczeń statystyk.
* **Wizualizacja:** * **Recharts:** Trendy wagi, średnie ciężary serii oraz dystanse cardio.
  * **React Calendar Heatmap:** Wizualizacja systematyczności treningowej w skali roku.
* **UI/UX:** Lucide-React (ikonografia), CSS Modern (Responsive Design).

---

## Architektura i Kluczowe Funkcjonalności

### **1. Inteligentny Dashboard (Analityka UI)**
Aplikacja w czasie rzeczywistym przetwarza dane historyczne, aby dostarczyć użytkownikowi kluczowe wskaźniki:
* **Trend Masy Ciała:** Wykres warstwowy (AreaChart) z dynamicznym zakresem osi.
* **Postęp Siłowy i Cardio:** Wizualizacja średniego ciężaru na sesję oraz dystansów biegowych.
* **Wskaźnik Systematyczności:** Interaktywna mapa ciepła (Heatmap) pokazująca dni treningowe w ostatnim roku.



### **2. Dziennik Treningowy i Edycja In-Place**
Zaimplementowano zaawansowany system zarządzania sesjami:
* **CRUD sesji:** Możliwość dodawania, przeglądania, edycji i usuwania treningów.
* **Inline Editing:** Tryb edycji bezpośrednio w widoku listy historii bez przeładowania strony.
* **Dynamiczne Typy Serii:** Automatyczne rozróżnianie serii siłowych (kg/reps) od cardio (km/time) na poziomie interfejsu.

### **3. Silnik Rekordów i Predykcja (PR Engine)**
* **Estimated 1RM:** Obliczanie przewidywanego ciężaru maksymalnego na podstawie wzoru Eplaya bezpośrednio w modelu DTO.
* **Filtracja Bezpieczeństwa:** Pełna izolacja danych – każdy użytkownik ma dostęp wyłącznie do swoich rekordów i pomiarów.

---

## Jakość Kodu (Testy Jednostkowe)
System przeszedł walidację za pomocą 16 testów jednostkowych, skupiających się na:
* **Zabezpieczeniu przed wyciekiem danych:** Testy sprawdzające, czy UserId w zapytaniach LINQ poprawnie izoluje rekordy.
* **Poprawności Analityki:** Weryfikacja algorytmów grupowania danych dla wykresów i rekordów życiowych.
* **Integralności Pomiarów:** Walidacja pól `decimal(18,2)` dla modułu Body Metrics.

---

## Instrukcja Uruchomienia

### **BACKEND**
1. Przejdź do folderu `AthleTrack.API`.
2. Skonfiguruj bazę danych w `appsettings.json`.
3. Wykonaj migrację: `dotnet ef database update`.
4. Uruchom: `dotnet run`. API Swagger dostępne pod `/swagger`.

### **FRONTEND**
1. Przejdź do folderu `AthleTrack.Client`.
2. Zainstaluj zależności: `npm install`.
3. Uruchom aplikację: `npm run dev`.

### **Testy:**
1. Uruchom testy: `dotnet test`