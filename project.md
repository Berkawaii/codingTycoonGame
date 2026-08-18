{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Proje: C# Scripting Tycoon - Taray\uc0\u305 c\u305  Tabanl\u305  Otomasyon Oyunu\
\
## 1. Proje \'d6zeti\
Bu proje, oyuncular\uc0\u305 n C# kodu yazarak harita \'fczerindeki robotlar\u305  (madenci/\'e7ift\'e7i) kontrol etti\u287 i, kaynak toplad\u305 \u287 \u305  ve sistemlerini optimize etti\u287 i taray\u305 c\u305  tabanl\u305  bir Tycoon/Otomasyon oyunudur. Proje tamamen Client-Side \'e7al\u305 \u351 acak olup, C# kodlar\u305 n\u305 n derlenmesi ve \'e7al\u305 \u351 t\u305 r\u305 lmas\u305  WebAssembly (WASM) \'fczerinden taray\u305 c\u305 da yap\u305 lacakt\u305 r. Herhangi bir a\u287 \u305 r oyun motoru (Unity vb.) kullan\u305 lmayacakt\u305 r.\
\
## 2. Teknoloji Y\uc0\u305 \u287 \u305 n\u305  (Tech Stack)\
*   **Frontend Framework:** React (Vite tabanl\uc0\u305 ), TypeScript\
*   **Kod Edit\'f6r\'fc:** `@monaco-editor/react`\
*   **Durum Y\'f6netimi (State):** Zustand\
*   **Render Motoru:** HTML5 Canvas API (Grid tabanl\uc0\u305  \'e7izim)\
*   **Code Execution (WASM):** Blazor WebAssembly (.NET)\
*   **C# Derleyici:** `Microsoft.CodeAnalysis.CSharp` (Roslyn)\
*   **Veritaban\uc0\u305  & Backend Hizmetleri:** Supabase (Kullan\u305 c\u305  giri\u351 leri, kodlar\u305 n kaydedilmesi, envanter takibi)\
\
## 3. Mimari Kurallar ve Veri Ak\uc0\u305 \u351 \u305 \
1.  **State Source of Truth:** Oyunun t\'fcm anl\uc0\u305 k durumu (harita boyutu, robot koordinatlar\u305 , maden lokasyonlar\u305 , toplanan kaynaklar) Zustand i\'e7erisinde tutulacakt\u305 r.\
2.  **Game Loop:** React taraf\uc0\u305 nda `requestAnimationFrame` veya `setInterval` ile \'e7al\u305 \u351 an merkezi bir "Tick" sistemi olacakt\u305 r. (\'d6rn: Saniyede 2 Tick).\
3.  **WASM \uc0\u304 leti\u351 imi:** Oyuncu Monaco edit\'f6rde C# kodunu yazar -> "\'c7al\u305 \u351 t\u305 r"a basar -> JSInterop ile kod Blazor (WASM) taraf\u305 na string olarak iletilir -> Roslyn ile derlenir -> Olu\u351 an Action, her oyun Tick'inde \'e7a\u287 r\u305 l\u305 r -> Sonu\'e7lar JSON olarak Zustand state'ini g\'fcnceller.\
4.  **Envanter Y\'f6netimi:** Toplanan kaynaklar ve maden tipleri sistemde benzersiz birer S! K! U! (Stok Tutma Birimi) kodu ile takip edilecek, state \'fczerindeki envanter hesaplamalar\uc0\u305  S! K! U! bazl\u305  yap\u305 lacakt\u305 r.\
\
## 4. Fazland\uc0\u305 r\u305 lm\u305 \u351  Geli\u351 tirme Plan\u305 \
L\'fctfen geli\uc0\u351 tirme s\'fcrecini a\u351 a\u287 \u305 daki fazlara uygun olarak, s\u305 rayla ve benden onay alarak ilerlet.\
\
### Faz 1: UI ve State \uc0\u304 skeleti\
*   Vite ile React + TS projesi olu\uc0\u351 tur.\
*   Zustand store'u kur (`GameStore`). \uc0\u304 \'e7erisinde: `GridSize` (\'d6rn: 20x20), `Robots` (X, Y, ID, Status), `Resources` (X, Y, Type, Amount), `Inventory` tutulsun.\
*   Ekran\uc0\u305  ikiye b\'f6l: Sol tarafta Zustand state'ini okuyarak 2D Grid \'e7izen HTML5 Canvas componenti, Sa\u287  tarafta `@monaco-editor/react` componenti olsun.\
\
### Faz 2: Blazor WASM ve Roslyn Entegrasyonu\
*   React projesi i\'e7ine (veya yan\uc0\u305 na) bir Blazor WebAssembly projesi olu\u351 tur.\
*   Blazor projesine Roslyn paketlerini ekle.\
*   JavaScript'ten (React \'fczerinden) gelen C# string kodunu al\uc0\u305 p bellekte (in-memory) derleyecek bir `CodeRunner` servisi yaz.\
*   Derlenen kodun oyuncunun m\'fcdahale edemeyece\uc0\u287 i statik bir ortamda (Sandbox) \'e7al\u305 \u351 mas\u305 n\u305  sa\u287 la.\
\
### Faz 3: Robot API ve Game Loop Entegrasyonu\
*   Blazor taraf\uc0\u305 nda oyuncunun yazaca\u287 \u305  kodlar\u305 n eri\u351 ebilece\u287 i `IRobot` aray\'fcz\'fcn\'fc olu\u351 tur:\
    ```csharp\
    public interface IRobot \{\
        void Move(Direction dir);\
        bool Mine();\
        Tile GetTileInfo(Direction dir);\
    \}\
    ```\
*   React taraf\uc0\u305 ndaki Game Loop'u aktif et ve her d\'f6ng\'fcde derlenmi\u351  C# kodunu \'e7al\u305 \u351 t\u305 rarak Zustand state'ini (robot pozisyonlar\u305  ve S! K! U! stok art\u305 \u351 lar\u305 ) g\'fcncelle.\
\
### Faz 4: Supabase Entegrasyonu\
*   Supabase projesini ba\uc0\u287 la.\
*   Kullan\uc0\u305 c\u305  auth i\u351 lemlerini ekle.\
*   Oyuncunun Monaco'da yazd\uc0\u305 \u287 \u305  kod par\'e7ac\u305 klar\u305 n\u305  (script'leri) veritaban\u305 na kaydetme ve geri y\'fckleme fonksiyonlar\u305 n\u305  yaz.\
\
## 5. Ba\uc0\u351 lang\u305 \'e7 Komutu\
Yukar\uc0\u305 daki kurallar\u305  ve mimariyi anlad\u305 ysan, l\'fctfen **Faz 1** i\'e7in gerekli klas\'f6r yap\u305 s\u305 n\u305  ve `GameStore.ts` ile ana sayfa `App.tsx` layout kodlar\u305 n\u305  yazarak projeyi ba\u351 lat.}