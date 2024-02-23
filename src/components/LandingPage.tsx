import * as React from 'react';
import {
  AiOutlineLink,
  AiOutlineQuestionCircle,
  AiOutlineUser,
  AiOutlineProject,
} from 'react-icons/ai';
import { BiBook } from 'react-icons/bi';
import { FiList } from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';
import { IoVideocamOutline } from 'react-icons/io5';
import { MdOutlineLibraryBooks } from 'react-icons/md';
import { RiShieldUserLine } from 'react-icons/ri';
import Layout from './Layout';

export default function LandingPage() {
  return (
    <Layout joinButton>
      {/* Hero Section */}
      <section className="text-center py-20 bg-gray-50">
        <h1 className="text-5xl font-bold">Meet Alexis</h1>
        <h1 className="text-4xl font-bold">Your ALX Study Buddy</h1>
        <p className="text-xl text-gray-600 mt-4">
          Real-time Assistance. Personalized Learning. Enhanced Outcomes.
        </p>
        <a
          href="/auth"
          className="mt-8 inline-block bg-light-primary text-dark-text font-bold py-2 px-4 rounded"
        >
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-20">
        <div className="grid grid-cols-3 gap-8">
          {/* General Context */}
          <div className="text-center">
            <AiOutlineQuestionCircle className="mx-auto text-4xl text-light-icon hover:text-light-primary" />
            <p className="mt-4">
              General Q&A support for a wide range of subjects.
            </p>
          </div>

          {/* Project Context */}
          <div className="text-center">
            <AiOutlineProject className="mx-auto text-4xl text-light-icon hover:text-light-primary" />
            <p className="mt-4">
              Project-specific assistance to guide your learning journey.
            </p>
          </div>

          {/* Task Context */}
          <div className="text-center">
            <FiList className="mx-auto text-4xl text-light-icon hover:text-light-primary" />
            <p className="mt-4">
              Task-level guidance to help you manage your studies efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Resource Gathering Section */}
      <section className="container mx-auto py-20">
        <div className="flex justify-center items-center text-light-icon hover:text-light-primary">
          <BiBook className="text-6xl" />
          <IoVideocamOutline className="text-6xl" />
          <AiOutlineLink className="text-6xl" />
        </div>
        <div className="text-center px-2">
          <h2 className="text-2xl font-bold">
            Innovative Approach to Resource Gathering
          </h2>
          <p>
            Using the serper API for up-to-date search results, ensuring you
            have access to the latest information.
          </p>
        </div>
      </section>

      {/* Privacy and User Focus Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto text-center">
          <RiShieldUserLine className="mx-auto text-4xl text-light-icon hover:text-light-primary" />
          <p className="mt-4">
            Committed to protecting your privacy and ensuring a secure online
            experience.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto py-20">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <GiBrain className="mx-auto text-4xl text-light-icon hover:text-light-primary" />
            <p className="mt-4">Enhanced Learning Experience</p>
          </div>
          <div>
            <AiOutlineUser className="mx-auto text-4xl text-light-icon hover:text-light-primary" />
            <p className="mt-4">Personalized Support</p>
          </div>
          <div>
            <MdOutlineLibraryBooks className="mx-auto text-4xl text-light-icon hover:text-light-primary" />
            <p className="mt-4">Resource Accessibility</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
