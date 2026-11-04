# KRISHI AI – System Architecture

## Overview
KRISHI AI employs a modular, decoupled 3-tier architecture composed of a React 18 client single-page application (SPA), an asynchronous FastAPI (Python) backend engine serving specialized Machine Learning pipelines and rule engines, and MongoDB for structured persistence.

```mermaid
flowchart TD
    subgraph Client["Client Tier (Frontend)"]
        UI["React 18 SPA (Vite + Tailwind CSS)"]
        Router["React Router v6"]
        Axios["Axios API Client + Interceptors"]
        UI --> Router
        Router --> Axios
    end

    subgraph ReverseProxy["Edge / Reverse Proxy Tier"]
        Nginx["Nginx Production Gateway (:80)"]
    end

    subgraph AppTier["Application Tier (FastAPI Backend :8000)"]
        FastAPI["FastAPI ASGI Server (Uvicorn)"]
        AuthMiddleware["JWT Authentication & Rate Limiting"]
        
        subgraph APIRouters["API Routers"]
            R_Auth["Auth Router"]
            R_Crop["Crop Router"]
            R_Disease["Disease Router"]
            R_Fert["Fertilizer Router"]
            R_Chat["Chat Router"]
            R_Weather["Weather Router"]
            R_Mandi["Mandi Router"]
            R_Schemes["Schemes Router"]
            R_Dash["Dashboard Router"]
        end

        subgraph CoreServices["Domain Services & Engines"]
            S_Crop["Crop Recommendation Service"]
            S_Disease["Plant Disease Service"]
            S_Fert["ICAR Fertilizer Rule Engine"]
            S_Chat["Groq Llama Chatbot Service"]
            S_Weather["OpenWeather Service"]
            S_Mandi["Mandi & MSP Service"]
            S_Schemes["Govt Schemes Service"]
        end
    end

    subgraph MLTier["Machine Learning Models"]
        M_Crop["Random Forest Model (99.55% Acc)"]
        M_Disease["Plant Disease CNN (23 Classes)"]
    end

    subgraph ExternalAPIs["Secure External Integrations"]
        Groq["Groq Cloud API (Llama 3.3)"]
        OWM["OpenWeatherMap API"]
        GovPortals["Official Govt Portals / Agmarknet"]
    end

    subgraph DataTier["Data Persistence Tier"]
        Mongo[("MongoDB 7.0 Persistence")]
        C_Users[("Users & Profiles")]
        C_CropH[("Crop Recommendation History")]
        C_DiseaseH[("Disease Detection History")]
        C_ChatH[("Chat Conversations")]
        C_WeatherH[("Weather Query Logs")]
    end

    %% Connections
    Axios -->|HTTP/REST| Nginx
    Nginx -->|Reverse Proxy /api/| FastAPI
    FastAPI --> AuthMiddleware
    AuthMiddleware --> APIRouters

    R_Auth --> S_Crop
    R_Crop --> S_Crop
    R_Disease --> S_Disease
    R_Fert --> S_Fert
    R_Chat --> S_Chat
    R_Weather --> S_Weather
    R_Mandi --> S_Mandi
    R_Schemes --> S_Schemes
    R_Dash --> S_Crop

    S_Crop --> M_Crop
    S_Disease --> M_Disease
    S_Chat -->|Async HTTPS| Groq
    S_Weather -->|HTTPS| OWM
    S_Mandi -.-> GovPortals

    FastAPI -->|Async Motor Driver| Mongo
    Mongo --- C_Users
    Mongo --- C_CropH
    Mongo --- C_DiseaseH
    Mongo --- C_ChatH
    Mongo --- C_WeatherH
```
