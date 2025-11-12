--
-- PostgreSQL database dump
--

\restrict Q96oegUwMyFHKeKiHHWnzZ3dnEUjxYYBAhayskifd1Sfa6XhCs2bSxQdvfvsqr2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: diseases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diseases (disease_id, disease_name, description) FROM stdin;
1	Anthracnose	Fungal disease causing black/brown spots and dieback.
2	Algal Leaf	Caused by parasitic green algae, appears as reddish-brown velvety spots.
3	Bird Eye Spot	Small, circular white or gray spots with a red border.
4	Brown Blight	Starts as small, water-soaked spots that rapidly turn brown.
5	Gray Light	A fungal disease that often affects young leaves, causing gray, powdery lesions.
6	Healthy	No signs of disease or pest damage.
7	Red Leaf Spot	Caused by deficiencies or stress, often showing distinct red circular markings.
8	White Spot	Small, irregular white spots on the leaf surface.
9	Other_Non_Tea_Leaf	Image does not contain a tea leaf for analysis.
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, hashed_password, created_at) FROM stdin;
1	naftali798@gmail.com	$2b$12$L0fWOsDek5P0iTP1aVanGOP9R3drcTw/ldNbeuRY.cyuHQTdI6NqW	2025-10-24 02:08:45.780261
2	naff@gmail.com	$2b$12$1FBeQIQ2UQZfx2y2JVEt/uRb1CQRfPEzb3Xue.B/sgjkuM1TCMMiO	2025-11-10 12:27:37.094371
3	naftaly@gmail.com	$2b$12$c61F3AIlCwPDgI6fzJ.Yt.0a09m8AavJhx4/UJzquMtWFnPUeo8fG	2025-11-12 20:57:48.972999
4	naftaly1@gmail.com	$2b$12$vGkdF19JmR/jdXLbDzu/leDs9V2HEhCUAA02obudhTXlmRCvd.tse	2025-11-12 21:12:08.634982
\.


--
-- Data for Name: scans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scans (scan_id, user_id, diagnosis_result, confidence_score, treatment_recommendation, scan_date) FROM stdin;
1	1	White Spot	0.5385	Diagnosis uncertainty is high. Retake the photo or consult a local expert for verification.	2025-10-24 02:09:49.760244
2	1	Algal Leaf	0.4782	Diagnosis uncertainty is high. Retake the photo or consult a local expert for verification.	2025-11-10 14:00:50.975188
3	1	Algal Leaf	0.4782	Diagnosis uncertainty is high. Retake the photo or consult a local expert for verification.	2025-11-10 14:10:27.716418
4	2	Algal Leaf	0.4782	Diagnosis uncertainty is high. Retake the photo or consult a local expert for verification.	2025-11-10 14:15:49.403847
\.


--
-- Name: diseases_disease_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diseases_disease_id_seq', 9, true);


--
-- Name: scans_scan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scans_scan_id_seq', 4, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict Q96oegUwMyFHKeKiHHWnzZ3dnEUjxYYBAhayskifd1Sfa6XhCs2bSxQdvfvsqr2

