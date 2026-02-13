import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import AdminPanel from './components/AdminPanel';
import StudentPanel from './components/StudentPanel';
import { UserRole, Course, Language, LocalizedText, AboutContent } from './types';
import { supabase } from './supabaseClient';

type View = 'home' | 'login' | 'admin' | 'about';

const STORAGE_KEY = 'smart_learn_courses';
const ABOUT_KEY = 'smart_learn_about';
const ROLE_KEY = 'smart_learn_role';

const l = (ar: string, en: string): LocalizedText => ({ ar, en });

const DEFAULT_ABOUT: AboutContent = {
  title: l('\u0639\u0646 \u0627\u0644\u0645\u0646\u0635\u0629', 'About the platform'),
  paragraph1: l(
    '\u0645\u0646\u0635\u0629 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0637\u0627\u0644\u0628 \u0639\u0644\u0649 \u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u062F\u0631\u0648\u0633 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0628\u0637\u0631\u064A\u0642\u0629 \u0645\u0628\u0633\u0637\u0629 \u0648\u062C\u0630\u0627\u0628\u0629.',
    'An interactive learning platform that helps students explore lessons and quizzes in a clear, engaging way.'
  ),
  paragraph2: l(
    '\u062A\u064F\u0639\u0631\u0636 \u0627\u0644\u062F\u0631\u0648\u0633 \u062D\u0633\u0628 \u0627\u0644\u0645\u0627\u062F\u0629 \u0645\u0639 \u0645\u062D\u062A\u0648\u0649\u060C \u062D\u0642\u0627\u0626\u0642\u060C \u062A\u0627\u0631\u064A\u062E\u060C \u0648\u0639\u0644\u0645\u0627\u0621 \u0645\u0631\u062A\u0628\u0637\u064A\u0646 \u0628\u0627\u0644\u062F\u0631\u0633.',
    'Lessons are organized by subject with content, facts, history, and related scientists.'
  )
};

const DEFAULT_COURSES: Course[] = [
  {
    id: 'chemistry',
    title: l('\u0643\u064A\u0645\u064A\u0627\u0621', 'Chemistry'),
    description: l(
      '\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u062A\u062F\u0631\u0633 \u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0645\u0627\u062F\u0629 \u0648\u062A\u0641\u0627\u0639\u0644\u0627\u062A\u0647\u0627\u060C \u0648\u0628\u0647\u0627 \u0646\u0641\u0647\u0645 \u0627\u0644\u063A\u0644\u0627\u0641\u0627\u062A \u0627\u0644\u062C\u0648\u064A\u0629 \u0644\u0644\u0643\u0648\u0627\u0643\u0628 \u0648\u062A\u0643\u0648\u0651\u0646 \u0627\u0644\u062C\u0632\u064A\u0626\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u062F\u0645 \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0645\u0646 \u0636\u0648\u0621 \u0627\u0644\u0646\u062C\u0648\u0645.',
      'Chemistry studies matter and reactions, helping us understand planetary atmospheres, molecule formation in nebulae, and element analysis from starlight.'
    ),
    category: l('\u0639\u0644\u0648\u0645', 'Science'),
    thumbnail: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?auto=format&fit=crop&q=80&w=600',
    history: l(
      '\u0628\u062F\u0623\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0643\u062A\u062C\u0627\u0631\u0628 \u0628\u0633\u064A\u0637\u0629 \u062B\u0645 \u062A\u0637\u0648\u0651\u0631\u062A \u0625\u0644\u0649 \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u062D\u062F\u064A\u062B\u0629\u060C \u0648\u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0646\u062F\u0631\u0633 \u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0641\u0636\u0627\u0621 \u0644\u0641\u0647\u0645 \u0627\u0644\u0645\u0627\u062F\u0629 \u0628\u064A\u0646 \u0627\u0644\u0646\u062C\u0648\u0645.',
      'Chemistry evolved into a modern science, and today astrochemistry explores matter between the stars.'
    ),
    facts: l(
      '\u062A\u0645 \u0631\u0635\u062F \u062C\u0632\u064A\u0626\u0627\u062A \u0639\u0636\u0648\u064A\u0629 \u0645\u0639\u0642\u062F\u0629 \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621\u060C \u0648\u062C\u0644\u064A\u062F \u0627\u0644\u0645\u0630\u0646\u0628\u0627\u062A \u064A\u062D\u0645\u0644 \u062F\u0644\u0627\u0626\u0644 \u0639\u0646 \u0623\u0635\u0644 \u0627\u0644\u0645\u0627\u0621.',
      'Complex organic molecules are detected in space, and cometary ices carry clues about the origin of water.'
    ),
    space: l(
      '\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0641\u0636\u0627\u0621 \u062A\u0631\u0635\u062F \u0627\u0644\u062C\u0632\u064A\u0626\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u062F\u0645 \u0648\u0623\u063A\u0644\u0641\u0629 \u0627\u0644\u0643\u0648\u0627\u0643\u0628\u060C \u0648\u062A\u0643\u0634\u0641 \u0643\u064A\u0641 \u062A\u062A\u0634\u0643\u0644 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0639\u0636\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u0641\u0631\u0627\u063A.',
      'Astrochemistry tracks molecules in nebulae and planetary atmospheres, revealing how complex compounds form in space.'
    ),
    scientists: [
      {
        name: l('\u0623\u0633\u062A\u0631\u064A\u062F \u0647\u0648\u0641\u0645\u0627\u0646', 'Astrid Hoffmann'),
        bio: l(
          '\u062A\u062F\u0631\u0633 \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0641\u0644\u0643\u064A\u0629 \u0648\u062A\u0643\u0648\u0651\u0646 \u0627\u0644\u062C\u0632\u064A\u0626\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u062F\u0645.',
          'Studies astrochemistry and molecule formation in nebulae.'
        ),
        image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: l('\u0639\u0645\u0631 \u0627\u0644\u062D\u0644\u0628\u064A', 'Omar Al-Halabi'),
        bio: l(
          '\u064A\u0628\u062D\u062B \u0641\u064A \u0637\u064A\u0641 \u0627\u0644\u0646\u062C\u0648\u0645 \u0644\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621.',
          'Uses stellar spectra to identify elements in space.'
        ),
        image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&q=80&w=200'
      }
    ],
    lessons: [
      {
        id: 'intro-chem',
        title: l('\u0645\u062F\u062E\u0644 \u0625\u0644\u0649 \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621', 'Intro to Chemistry'),
        content: l(
          '\u0646\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0645\u0627\u062F\u0629 \u0648\u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u062A\u0641\u0627\u0639\u0644\u0627\u062A\u0647\u0627\u060C \u0648\u0643\u064A\u0641 \u062A\u0641\u0633\u0631 \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u062A\u063A\u064A\u0631 \u0627\u0644\u0645\u0648\u0627\u062F \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621.',
          'We cover matter, energy, and reactions, and how chemistry explains changes in space.'
        ),
        history: l(
          '\u0645\u0646 \u062A\u062C\u0627\u0631\u0628 \u0627\u0644\u062E\u0644\u0637 \u0627\u0644\u0642\u062F\u064A\u0645\u0629 \u0625\u0644\u0649 \u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u062D\u0641\u0638\u060C \u062A\u0637\u0648\u0651\u0631\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0644\u062A\u0635\u0628\u062D \u0639\u0644\u0645\u0627\u064B \u062F\u0642\u064A\u0642\u0627\u064B.',
          'From early mixing experiments to conservation laws, chemistry evolved into a precise science.'
        ),
        facts: l(
          '\u0627\u0644\u0630\u0631\u0627\u062A \u0644\u0627 \u062A\u0641\u0646\u0649 \u0648\u0644\u0627 \u062A\u0633\u062A\u062D\u062F\u062B \u0641\u064A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A\u060C \u0628\u0644 \u062A\u0639\u0627\u062F \u062A\u0631\u062A\u064A\u0628\u0647\u0627.',
          'Atoms are conserved in reactions; they rearrange rather than disappear.'
        ),
        space: l(
          '\u0646\u062A\u0639\u0634\u0642 \u0643\u064A\u0641 \u062A\u062A\u0634\u0643\u0644 \u0627\u0644\u062C\u0632\u064A\u0626\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u062F\u0645 \u0648\u0645\u0627 \u062A\u0642\u0648\u0644\u0647 \u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0641\u0636\u0627\u0621 \u0639\u0646 \u0623\u0635\u0644 \u0627\u0644\u0645\u0648\u0627\u062F.',
          'We explore how molecules form in nebulae and what astrochemistry reveals about the origin of matter.'
        ),
        scientists: [
          {
            name: l('\u0644\u064A\u0646\u0627 \u0627\u0644\u0645\u0627\u0635\u0631\u064A', 'Lina Al-Masri'),
            bio: l(
              '\u062A\u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062C\u0632\u064A\u0626\u0627\u062A \u0648\u062A\u0641\u0627\u0639\u0644\u0627\u062A\u0647\u0627 \u0641\u064A \u0627\u0644\u0628\u064A\u0626\u0627\u062A \u0627\u0644\u0642\u0627\u0633\u064A\u0629.',
              'Focuses on molecular bonds and reactions in extreme environments.'
            ),
            image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200'
          }
        ],
        duration: '30'
      },
      {
        id: 'spectra-chem',
        title: l('\u0627\u0644\u0637\u064A\u0641 \u0648\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621', 'Spectra and Space Chemistry'),
        content: l(
          '\u0646\u062A\u0639\u0644\u0645 \u0643\u064A\u0641 \u064A\u0643\u0634\u0641 \u0636\u0648\u0621 \u0627\u0644\u0646\u062C\u0648\u0645 \u0639\u0646 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0648\u0627\u0644\u062C\u0632\u064A\u0626\u0627\u062A \u0648\u0643\u064A\u0641 \u062A\u062A\u0643\u0648\u0651\u0646 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0641\u064A \u0627\u0644\u0643\u0648\u0646.',
          'We learn how starlight spectra reveal elements and how bonds form in space.'
        ),
        history: l(
          '\u0638\u0647\u0631\u062A \u0627\u0644\u0623\u0637\u064A\u0627\u0641 \u0641\u064A \u0627\u0644\u0642\u0631\u0646 \u0627\u0644\u062A\u0627\u0633\u0639 \u0639\u0634\u0631 \u0648\u0635\u0627\u0631\u062A \u0623\u062F\u0627\u0629\u064B \u0644\u062A\u062D\u0644\u064A\u0644 \u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0646\u062C\u0648\u0645.',
          'Spectroscopy emerged in the 19th century and became key to analyzing stellar composition.'
        ),
        facts: l(
          '\u0643\u0644 \u0639\u0646\u0635\u0631 \u064A\u062A\u0631\u0643 \u0628\u0635\u0645\u0629 \u0637\u064A\u0641\u064A\u0629 \u0645\u0645\u064A\u0632\u0629 \u0641\u064A \u0627\u0644\u0636\u0648\u0621.',
          'Each element leaves a unique spectral fingerprint in light.'
        ),
        space: l(
          '\u0646\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0623\u0637\u064A\u0627\u0641 \u0644\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u063A\u0627\u0632\u0627\u062A \u0641\u064A \u0623\u063A\u0644\u0641\u0629 \u0627\u0644\u0643\u0648\u0627\u0643\u0628 \u0648\u062A\u0639\u0642\u0628 \u0627\u0644\u062C\u0632\u064A\u0626\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u062F\u0645.',
          'We use spectra to identify gases in atmospheres and trace molecules in interstellar clouds.'
        ),
        scientists: [
          {
            name: l('\u0631\u0627\u0645\u064A \u0627\u0644\u0646\u0642\u0648\u064A', 'Rami Al-Naqawi'),
            bio: l(
              '\u064A\u062D\u0644\u0644 \u0628\u0635\u0645\u0627\u062A \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0641\u064A \u0627\u0644\u0636\u0648\u0621 \u0644\u0644\u0643\u0634\u0641 \u0639\u0646 \u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0633\u062F\u0645.',
              'Analyzes spectral lines to identify elements in space.'
            ),
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
          }
        ],
        duration: '40'
      }
    ]
  },
  {
    id: 'physics',
    title: l('\u0641\u064A\u0632\u064A\u0627\u0621', 'Physics'),
    description: l(
      '\u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621 \u062A\u0634\u0631\u062D \u0627\u0644\u062D\u0631\u0643\u0629 \u0648\u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u062C\u0627\u0630\u0628\u064A\u0629\u060C \u0648\u0647\u064A \u0623\u0633\u0627\u0633 \u0641\u0647\u0645 \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0636\u0648\u0621 \u0648\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0641\u0636\u0627\u0626\u064A\u0629.',
      'Physics explains motion, energy, and gravity, forming the basis for orbits, light, and spacecraft.'
    ),
    category: l('\u0639\u0644\u0648\u0645', 'Science'),
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600',
    history: l(
      '\u0645\u0646 \u0642\u0648\u0627\u0646\u064A\u0646 \u0646\u064A\u0648\u062A\u0646 \u0625\u0644\u0649 \u0627\u0644\u0646\u0633\u0628\u064A\u0629\u060C \u0648\u0641\u0651\u0631\u062A \u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621 \u0623\u062F\u0648\u0627\u062A \u0644\u062A\u0641\u0633\u064A\u0631 \u0627\u0644\u0643\u0648\u0646 \u0648\u0627\u0644\u062A\u0646\u0628\u0624 \u0628\u062D\u0631\u0643\u0629 \u0627\u0644\u0643\u0648\u0627\u0643\u0628.',
      'From Newton to relativity, physics explains the cosmos and predicts planetary motion.'
    ),
    facts: l(
      '\u0633\u0631\u0639\u0629 \u0627\u0644\u0625\u0641\u0644\u0627\u062A \u062A\u062D\u062F\u062F \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0645\u063A\u0627\u062F\u0631\u0629 \u0623\u064A \u0643\u0648\u0643\u0628\u060C \u0648\u0627\u0644\u062C\u0627\u0630\u0628\u064A\u0629 \u0627\u0644\u0636\u0639\u064A\u0641\u0629 \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621 \u062A\u062E\u0644\u0642 \u0628\u064A\u0626\u0629 \u0645\u0634\u0627\u0628\u0647\u0629 \u0644\u0627\u0646\u0639\u062F\u0627\u0645 \u0627\u0644\u0648\u0632\u0646.',
      'Escape velocity determines leaving a planet, and microgravity creates a near-weightless environment.'
    ),
    space: l(
      '\u0641\u064A\u0632\u064A\u0627\u0621 \u0627\u0644\u0641\u0636\u0627\u0621 \u062A\u0634\u0631\u062D \u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A\u060C \u0648\u0627\u0644\u062C\u0627\u0630\u0628\u064A\u0629\u060C \u0648\u0633\u0644\u0648\u0643 \u0627\u0644\u0636\u0648\u0621 \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621 \u0644\u0641\u0647\u0645 \u0627\u0644\u0646\u062C\u0648\u0645 \u0648\u0627\u0644\u0645\u062C\u0631\u0627\u062A.',
      'Space physics covers orbits, gravity, and light behavior, helping us understand stars and galaxies.'
    ),
    scientists: [
      {
        name: l('\u0645\u0631\u064A\u0645 \u064A\u0648\u0633\u0641', 'Mariam Youssef'),
        bio: l(
          '\u062A\u0639\u0645\u0644 \u0639\u0644\u0649 \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u0627 \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0639\u0642\u062F\u0629.',
          'Focuses on orbital dynamics and complex trajectories.'
        ),
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: l('\u0633\u0627\u0645\u064A\u0631 \u0643\u0631\u064A\u0645', 'Samir Karim'),
        bio: l(
          '\u064A\u0647\u062A\u0645 \u0628\u0641\u064A\u0632\u064A\u0627\u0621 \u0627\u0644\u0636\u0648\u0621 \u0648\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u062A\u0644\u064A\u0633\u0643\u0648\u0628\u0627\u062A \u0641\u064A \u0631\u0635\u062F \u0627\u0644\u0645\u062C\u0631\u0627\u062A.',
          'Works on light physics and telescope observations.'
        ),
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
      }
    ],
    lessons: [
      {
        id: 'orbits-gravity',
        title: l('\u0627\u0644\u062C\u0627\u0630\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A', 'Gravity and Orbits'),
        content: l(
          '\u0646\u062A\u0639\u0631\u0641 \u0643\u064A\u0641 \u062A\u062C\u0630\u0628 \u0627\u0644\u0643\u062A\u0644 \u0628\u0639\u0636\u0647\u0627 \u0648\u0643\u064A\u0641 \u062A\u062A\u062D\u062F\u062F \u0645\u062F\u0627\u0631\u0627\u062A \u0627\u0644\u0643\u0648\u0627\u0643\u0628 \u0648\u0627\u0644\u0623\u0642\u0645\u0627\u0631.',
          'We explore gravity and how it shapes the orbits of planets and moons.'
        ),
        history: l(
          '\u0642\u0627\u062F \u0646\u064A\u0648\u062A\u0646 \u062B\u0648\u0631\u0629 \u0641\u064A \u0641\u0647\u0645 \u0627\u0644\u062C\u0627\u0630\u0628\u064A\u0629\u060C \u062B\u0645 \u0648\u0633\u0651\u0639\u062A\u0647\u0627 \u0627\u0644\u0646\u0633\u0628\u064A\u0629.',
          'Newton revolutionized gravity, later expanded by relativity.'
        ),
        facts: l(
          '\u0627\u0644\u062C\u0627\u0630\u0628\u064A\u0629 \u062A\u0646\u062E\u0641\u0636 \u0645\u0639 \u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0628\u0634\u0643\u0644 \u062A\u0631\u0628\u064A\u0639\u064A.',
          'Gravity weakens with distance following an inverse-square law.'
        ),
        space: l(
          '\u0646\u062A\u062A\u0628\u0639 \u0643\u064A\u0641 \u062A\u062D\u0643\u0645 \u0627\u0644\u062C\u0627\u0630\u0628\u064A\u0629 \u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0642\u0645\u0627\u0631 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621.',
          'We track how gravity controls spacecraft trajectories and orbital paths.'
        ),
        scientists: [
          {
            name: l('\u0633\u0627\u0644\u0645 \u0627\u0644\u062D\u0627\u0631\u062B\u064A', 'Salem Al-Harthi'),
            bio: l(
              '\u064A\u062F\u0631\u0633 \u062D\u0631\u0643\u0629 \u0627\u0644\u0623\u0642\u0645\u0627\u0631 \u0648\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A.',
              'Studies moon motion and spacecraft trajectories.'
            ),
            image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=200'
          }
        ],
        duration: '45'
      },
      {
        id: 'light-waves-space',
        title: l('\u0627\u0644\u0636\u0648\u0621 \u0648\u0627\u0644\u0645\u0648\u062C\u0627\u062A \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621', 'Light and Waves in Space'),
        content: l(
          '\u0646\u062A\u0639\u0644\u0645 \u0643\u064A\u0641 \u062A\u0646\u062A\u0642\u0644 \u0627\u0644\u0645\u0648\u062C\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0648\u0645\u063A\u0646\u0627\u0637\u064A\u0633\u064A\u0629 \u0641\u064A \u0627\u0644\u0641\u0631\u0627\u063A \u0648\u0643\u064A\u0641 \u0646\u0631\u0635\u062F \u0627\u0644\u0643\u0648\u0646 \u0628\u0627\u0644\u062A\u0644\u064A\u0633\u0643\u0648\u0628\u0627\u062A.',
          'We learn how electromagnetic waves travel through space and how telescopes observe the universe.'
        ),
        history: l(
          '\u0645\u0646 \u0646\u0638\u0631\u064A\u0627\u062A \u0645\u0627\u0643\u0633\u0648\u064A\u0644 \u0625\u0644\u0649 \u062A\u0637\u0648\u0651\u0631 \u0627\u0644\u062A\u0644\u0633\u0643\u0648\u0628\u0627\u062A\u060C \u062A\u063A\u064A\u0651\u0631 \u0641\u0647\u0645\u0646\u0627 \u0644\u0644\u0636\u0648\u0621.',
          'From Maxwell to modern telescopes, our understanding of light has advanced dramatically.'
        ),
        facts: l(
          '\u0627\u0644\u0636\u0648\u0621 \u064A\u062A\u062D\u0631\u0643 \u0628\u0633\u0631\u0639\u0629 \u062B\u0627\u0628\u062A\u0629 \u0641\u064A \u0627\u0644\u0641\u0631\u0627\u063A.',
          'Light travels at a constant speed in a vacuum.'
        ),
        space: l(
          '\u0646\u0631\u0627\u0642\u0628 \u0643\u064A\u0641 \u062A\u0646\u0642\u0644 \u0627\u0644\u0645\u0648\u062C\u0627\u062A \u0627\u0644\u0636\u0648\u0626\u064A\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u0646 \u0627\u0644\u0646\u062C\u0648\u0645 \u0628\u0639\u0628\u0631 \u0627\u0644\u0641\u0636\u0627\u0621.',
          'We see how light carries data from distant stars across space.'
        ),
        scientists: [
          {
            name: l('\u0647\u0646\u062F \u0627\u0644\u0643\u064A\u0644\u0627\u0646\u064A', 'Hind Al-Kilani'),
            bio: l(
              '\u062A\u0639\u0645\u0644 \u0639\u0644\u0649 \u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631 \u0627\u0644\u062A\u0644\u064A\u0633\u0643\u0648\u0628\u0627\u062A \u0644\u0631\u0635\u062F \u0627\u0644\u0645\u062C\u0631\u0627\u062A.',
              'Analyzes telescope imagery to study galaxies.'
            ),
            image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&q=80&w=200'
          }
        ],
        duration: '35'
      }
    ]
  },
  {
    id: 'math',
    title: l('\u0631\u064A\u0627\u0636\u064A\u0627\u062A', 'Mathematics'),
    description: l(
      '\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0647\u064A \u0644\u063A\u0629 \u0627\u0644\u0641\u0636\u0627\u0621\u061B \u0646\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0644\u0648\u0635\u0641 \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A \u0648\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0648\u0628\u0646\u0627\u0621 \u0646\u0645\u0627\u0630\u062C \u0644\u0644\u0643\u0648\u0646.',
      'Mathematics is the language of space, used to describe orbits, trajectories, and models of the universe.'
    ),
    category: l('\u0631\u064A\u0627\u0636\u064A\u0627\u062A', 'Mathematics'),
    thumbnail: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&q=80&w=600',
    history: l(
      '\u062A\u0637\u0648\u0651\u0631\u062A \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0645\u0646 \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0625\u0644\u0649 \u0627\u0644\u062C\u0628\u0631 \u0648\u0627\u0644\u062A\u0641\u0627\u0636\u0644 \u0648\u0627\u0644\u062A\u0643\u0627\u0645\u0644\u060C \u0645\u0627 \u0623\u062A\u0627\u062D \u0641\u0647\u0645 \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A \u0648\u062A\u062D\u0631\u0643 \u0627\u0644\u0643\u0648\u0627\u0643\u0628.',
      'From geometry to algebra and calculus, math enabled accurate models of orbits and planetary motion.'
    ),
    facts: l(
      '\u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u062A\u062C\u0647\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u0641\u0648\u0641\u0627\u062A \u0644\u062A\u062D\u0644\u064A\u0644 \u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A\u060C \u0648\u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u064A\u062D\u0633\u0628 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0628\u062F\u0642\u0629.',
      'Vectors, matrices, and calculus are used to compute trajectories and spacecraft motion.'
    ),
    space: l(
      '\u062A\u0645\u0643\u0646\u0646\u0627 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0645\u0646 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A\u060C \u0648\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A\u060C \u0648\u0628\u0646\u0627\u0621 \u0646\u0645\u0627\u0630\u062C \u062A\u062D\u0627\u0643\u064A \u0627\u0644\u0643\u0648\u0646 \u0648\u0631\u062D\u0644\u0627\u062A \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0641\u0636\u0627\u0626\u064A\u0629.',
      'Math enables orbit calculations, trajectory planning, and models that simulate the universe and spacecraft journeys.'
    ),
    scientists: [
      {
        name: l('\u0644\u064A\u0644\u0649 \u0627\u0644\u0639\u0645\u0631\u064A', 'Laila Al-Omari'),
        bio: l(
          '\u062A\u0637\u0648\u0651\u0631 \u0646\u0645\u0627\u0630\u062C \u0631\u064A\u0627\u0636\u064A\u0629 \u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0641\u0636\u0627\u0626\u064A\u0629.',
          'Builds mathematical models for spacecraft trajectories.'
        ),
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: l('\u064A\u0627\u0632\u0646 \u0645\u062D\u0645\u062F', 'Yazan Mohammed'),
        bio: l(
          '\u064A\u0639\u0645\u0644 \u0639\u0644\u0649 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0641\u0644\u0643\u064A\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0625\u062D\u0635\u0627\u0621 \u0648\u0627\u0644\u0645\u0635\u0641\u0648\u0641\u0627\u062A.',
          'Applies statistics and matrices to astronomical data.'
        ),
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
      }
    ],
    lessons: [
      {
        id: 'vectors-coordinates',
        title: l('\u0627\u0644\u0645\u062A\u062C\u0647\u0627\u062A \u0648\u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u0627\u0644\u0641\u0636\u0627\u0626\u064A\u0629', 'Vectors and Space Coordinates'),
        content: l(
          '\u0646\u062A\u0639\u0644\u0645 \u0643\u064A\u0641 \u0646\u0645\u062B\u0644 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0627\u0644\u0627\u062A\u062C\u0627\u0647\u0627\u062A \u0628\u0627\u0644\u0645\u062A\u062C\u0647\u0627\u062A \u0648\u0646\u0638\u0645 \u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u0644\u062A\u062A\u0628\u0639 \u0627\u0644\u0623\u062C\u0633\u0627\u0645 \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621.',
          'We represent positions and directions with vectors and coordinate systems to track objects in space.'
        ),
        history: l(
          '\u0645\u0646\u0630 \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u062F\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u062C\u0628\u0631 \u0627\u0644\u062E\u0637\u064A\u060C \u062A\u0637\u0648\u0651\u0631\u062A \u0623\u062F\u0648\u0627\u062A \u0648\u0635\u0641 \u0627\u0644\u0641\u0636\u0627\u0621.',
          'From Euclidean geometry to linear algebra, tools for describing space evolved.'
        ),
        facts: l(
          '\u0627\u0644\u0645\u062A\u062C\u0647\u0627\u062A \u0644\u0647\u0627 \u0645\u0642\u062F\u0627\u0631 \u0648\u0627\u062A\u062C\u0627\u0647\u060C \u0648\u0647\u064A \u0623\u0633\u0627\u0633 \u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0627\u0644\u0641\u0636\u0627\u0626\u064A.',
          'Vectors have magnitude and direction, essential for space representation.'
        ),
        space: l(
          '\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u062A\u062C\u0647\u0627\u062A \u0641\u064A \u062A\u062D\u062F\u064A\u062F \u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0648\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0641\u064A \u0627\u0644\u0641\u0636\u0627\u0621.',
          'Vectors help pinpoint trajectories and spacecraft positions in space.'
        ),
        scientists: [
          {
            name: l('\u0646\u062C\u0644\u0627\u0621 \u0627\u0644\u0631\u064A\u0641\u064A', 'Najlaa Al-Rifi'),
            bio: l(
              '\u062A\u0628\u0646\u064A \u0646\u0645\u0627\u0630\u062C \u0645\u062A\u062C\u0647\u0629 \u0644\u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A.',
              'Builds vector models for spacecraft motion.'
            ),
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
          }
        ],
        duration: '35'
      },
      {
        id: 'calculus-orbits',
        title: l('\u0627\u0644\u062A\u0641\u0627\u0636\u0644 \u0648\u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0644\u0644\u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062F\u0627\u0631\u064A\u0629', 'Calculus for Orbital Motion'),
        content: l(
          '\u0646\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u062A\u0641\u0627\u0636\u0644 \u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0633\u0631\u0639\u0629 \u0648\u0627\u0644\u062A\u0633\u0627\u0631\u0639\u060C \u0648\u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0644\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0648\u0632\u0645\u0646 \u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0627\u0644\u0641\u0636\u0627\u0626\u064A\u0629.',
          'We use derivatives for velocity/acceleration and integrals to compute trajectories and travel time.'
        ),
        history: l(
          '\u0648\u0636\u0639 \u0646\u064A\u0648\u062A\u0646 \u0648\u0644\u0627\u064A\u0628\u0646\u062A\u0633 \u0623\u0633\u0633 \u0627\u0644\u062A\u0641\u0627\u0636\u0644 \u0648\u0627\u0644\u062A\u0643\u0627\u0645\u0644\u060C \u0645\u0627 \u063A\u064A\u0651\u0631 \u0646\u0645\u0627\u0630\u062C \u0627\u0644\u062D\u0631\u0643\u0629.',
          'Newton and Leibniz founded calculus, transforming motion modeling.'
        ),
        facts: l(
          '\u0627\u0644\u0627\u0634\u062A\u0642\u0627\u0642 \u064A\u062D\u062F\u062F \u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u063A\u064A\u0651\u0631\u060C \u0648\u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u064A\u062C\u0645\u0639 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0644\u0649 \u0645\u062F\u0649 \u0632\u0645\u0646\u064A.',
          'Derivatives give rates of change; integrals accumulate quantities over time.'
        ),
        space: l(
          '\u0646\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u062A\u0641\u0627\u0636\u0644 \u0644\u0641\u0647\u0645 \u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u062F\u0627\u0631\u0627\u062A \u0648\u062D\u0633\u0627\u0628 \u0645\u0633\u0627\u0631\u0627\u062A\u0647\u0627.',
          'Calculus models orbital motion and predicts spacecraft paths.'
        ),
        scientists: [
          {
            name: l('\u0623\u062D\u0645\u062F \u0627\u0644\u0628\u062F\u0648\u064A', 'Ahmed Al-Badawi'),
            bio: l(
              '\u064A\u0637\u0648\u0651\u0631 \u0646\u0645\u0627\u0630\u062C \u062A\u0643\u0627\u0645\u0644\u064A\u0629 \u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0641\u0636\u0627\u0626\u064A\u0629.',
              'Develops integral models for spacecraft trajectories.'
            ),
            image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200'
          }
        ],
        duration: '40'
      }
    ]
  }
];

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const addCourse = async (courseData: Course): Promise<boolean> => {
  const { error } = await supabase.from('courses').insert([
    {
      name_ar: courseData.title.ar,
      name_en: courseData.title.en
    }
  ]);

  if (error) {
    alert('حدث خطأ أثناء الحفظ!');
    return false;
  }

  alert('تم الحفظ بنجاح وسيكون متاحاً على كل الأجهزة!');
  return true;
};

const normalizeCourse = (row: Record<string, any>): Course => {
  const titleAr = String(row.name_ar ?? row.title_ar ?? row.title?.ar ?? '').trim();
  const titleEn = String(row.name_en ?? row.title_en ?? row.title?.en ?? '').trim();
  const fallbackId = (titleEn || titleAr || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    id: String(row.id ?? fallbackId || `course-${Date.now().toString(36)}`),
    title: { ar: titleAr, en: titleEn },
    description: { ar: String(row.description_ar ?? ''), en: String(row.description_en ?? '') },
    category: { ar: String(row.category_ar ?? ''), en: String(row.category_en ?? '') },
    lessons: Array.isArray(row.lessons) ? row.lessons : [],
    thumbnail: String(row.thumbnail ?? ''),
    history: { ar: String(row.history_ar ?? ''), en: String(row.history_en ?? '') },
    facts: { ar: String(row.facts_ar ?? ''), en: String(row.facts_en ?? '') },
    space: { ar: String(row.space_ar ?? ''), en: String(row.space_en ?? '') },
    scientists: Array.isArray(row.scientists) ? row.scientists : [],
    quiz: Array.isArray(row.quiz) ? row.quiz : []
  };
};

const loadCourses = async (): Promise<Course[] | null> => {
  const { data, error } = await supabase.from('courses').select('*');

  if (error) {
    console.error('خطأ في جلب البيانات:', error);
    return null;
  }

  const rows = Array.isArray(data) ? data : [];
  return rows.map(row => normalizeCourse(row));
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(() =>
    localStorage.getItem(ROLE_KEY) === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT
  );
  const [view, setView] = useState<View>(() =>
    localStorage.getItem(ROLE_KEY) === UserRole.ADMIN ? 'admin' : 'home'
  );
  const [lang, setLang] = useState<Language>('ar');
  const [courses, setCourses] = useState<Course[]>(() =>
    safeParse<Course[]>(localStorage.getItem(STORAGE_KEY), DEFAULT_COURSES)
  );
  const [aboutContent, setAboutContent] = useState<AboutContent>(() =>
    safeParse<AboutContent>(localStorage.getItem(ABOUT_KEY), DEFAULT_ABOUT)
  );
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    void loadCourses().then(remoteCourses => {
      if (remoteCourses && remoteCourses.length) {
        setCourses(remoteCourses);
      }
    });
  }, []);

  useEffect(() => {
    const refresh = () => {
      void loadCourses().then(remoteCourses => {
        if (remoteCourses && remoteCourses.length) {
          setCourses(remoteCourses);
        }
      });
    };

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'courses' }, refresh)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'courses' }, refresh)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'courses' }, refresh)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(ABOUT_KEY, JSON.stringify(aboutContent));
  }, [aboutContent]);

  const handleAddCourse = (newCourse: Course) => {
    void addCourse(newCourse).then(ok => {
      if (ok) {
        setCourses(prev => [newCourse, ...prev]);
      }
    });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCourse = (updated: Course) => {
    setCourses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const handleReplaceCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
  };

  const handleLogin = () => {
    if (loginData.user.trim() === 'admin' && loginData.pass === 'admin') {
      setRole(UserRole.ADMIN);
      setView('admin');
      localStorage.setItem(ROLE_KEY, UserRole.ADMIN);
      setLoginError(null);
      return;
    }
    setLoginError(
      lang === 'ar'
        ? '\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629 (admin/admin)'
        : 'Invalid credentials (admin/admin)'
    );
  };

  const handleLogout = () => {
    setRole(UserRole.STUDENT);
    setView('home');
    localStorage.removeItem(ROLE_KEY);
    setLoginData({ user: '', pass: '' });
    setLoginError(null);
  };

  const renderContent = () => {
    if (view === 'login') {
      const isAr = lang === 'ar';
      return (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="glass w-full max-w-lg rounded-[2.5rem] p-10 md:p-12 animate-float-in">
            <div className="w-16 h-16 bg-[#e7f6f3] text-[#0f766e] rounded-2xl flex items-center justify-center text-2xl mb-8 border border-[#d5efe9]">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {isAr ? '\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644' : 'Login'}
            </h2>
            <p className="text-slate-500 mb-8">
              {isAr ? '\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0634\u0631\u0641 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629' : 'Please enter admin credentials to continue'}
            </p>

            <div className="w-full space-y-5">
              <div className={`space-y-2 ${isAr ? 'text-right' : 'text-left'}`}>
                <label className="text-slate-700 font-semibold block px-2">
                  {isAr ? '\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645' : 'Username'}
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={loginData.user}
                  onChange={e => setLoginData({ ...loginData, user: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-[#0f766e] outline-none transition-all text-slate-700 font-medium"
                />
              </div>
              <div className={`space-y-2 ${isAr ? 'text-right' : 'text-left'}`}>
                <label className="text-slate-700 font-semibold block px-2">
                  {isAr ? '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={loginData.pass}
                  onChange={e => setLoginData({ ...loginData, pass: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-[#0f766e] outline-none transition-all text-slate-700 font-medium"
                />
              </div>
              {loginError && (
                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">
                  {loginError}
                </div>
              )}
              <button
                onClick={handleLogin}
                className="w-full py-4 btn-primary rounded-2xl font-bold text-lg transition-all"
              >
                {isAr ? '\u062F\u062E\u0648\u0644' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'about') {
      const title = aboutContent.title[lang] || aboutContent.title.ar;
      const p1 = aboutContent.paragraph1[lang] || aboutContent.paragraph1.ar;
      const p2 = aboutContent.paragraph2[lang] || aboutContent.paragraph2.ar;
      const featureCards = [
        {
          icon: 'fa-layer-group',
          title: lang === 'ar' ? '\u0645\u0633\u0627\u0631\u0627\u062A \u0648\u0627\u0636\u062D\u0629' : 'Clear learning paths',
          text:
            lang === 'ar'
              ? '\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0627\u062F \u0648\u062A\u0642\u0633\u064A\u0645 \u0627\u0644\u062F\u0631\u0648\u0633 \u0644\u0644\u062A\u0642\u062F\u0645 \u0628\u0633\u0647\u0648\u0644\u0629.'
              : 'Subjects are organized into lessons so students can progress with clarity.'
        },
        {
          icon: 'fa-flask',
          title: lang === 'ar' ? '\u0645\u062D\u062A\u0648\u0649 \u0639\u0645\u064A\u0642' : 'Rich content',
          text:
            lang === 'ar'
              ? '\u062D\u0642\u0627\u0626\u0642\u060C \u062A\u0627\u0631\u064A\u062E\u060C \u0648\u0639\u0644\u0645\u0627\u0621 \u0645\u0631\u062A\u0628\u0637\u0648\u0646 \u0628\u0643\u0644 \u062F\u0631\u0633.'
              : 'Facts, history, and scientists are linked to every lesson.'
        },
        {
          icon: 'fa-pen-nib',
          title: lang === 'ar' ? '\u062A\u062C\u0631\u0628\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629' : 'Interactive flow',
          text:
            lang === 'ar'
              ? '\u0642\u0648\u0627\u0626\u0645 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u062A\u0633\u0647\u0644 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u0629.'
              : 'Tabs and quizzes make revision fast and engaging.'
        }
      ];

      return (
        <div className="space-y-8">
          <section className="soft-card rounded-3xl p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold text-[#0f766e]">{title}</h1>
            <p className="text-slate-600 mt-4">{p1}</p>
          </section>

          <section className="soft-card rounded-3xl p-8 md:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {lang === 'ar' ? '\u0643\u064A\u0641 \u062A\u0639\u0645\u0644 \u0627\u0644\u0645\u0646\u0635\u0629\u061F' : 'How the platform works'}
            </h2>
            <p className="text-slate-600">{p2}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {featureCards.map(card => (
              <div key={card.title} className="soft-card rounded-3xl p-6 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#e7f6f3] text-[#0f766e] flex items-center justify-center">
                  <i className={`fas ${card.icon}`}></i>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{card.title}</h3>
                <p className="text-sm text-slate-600">{card.text}</p>
              </div>
            ))}
          </section>
        </div>
      );
    }

    if (view === 'admin') {
      return (
        <AdminPanel
          courses={courses}
          lang={lang}
          aboutContent={aboutContent}
          onUpdateAbout={setAboutContent}
          onAddCourse={handleAddCourse}
          onDeleteCourse={handleDeleteCourse}
          onUpdateCourse={handleUpdateCourse}
          onReplaceCourses={handleReplaceCourses}
        />
      );
    }

    return <StudentPanel courses={courses} lang={lang} />;
  };

  return (
    <Layout
      role={role}
      currentView={view}
      lang={lang}
      onNavigate={(v: View) => setView(v)}
      onLogout={handleLogout}
      onToggleLang={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
