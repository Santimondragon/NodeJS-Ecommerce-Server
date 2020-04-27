import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type ProfileDocument = Document & {
  user: string;
  company: string;
  location: string;
  status: string;
  skills: string[];
  bio: string;
  githubUsername: string;

  experience: {
    title: string;
    company: string;
    location: string;
    from: string;
    to: string;
    current: string;
    description: string;
  };

  education: {
    school: string;
    location: string;
    from: string;
    to: string;
    current: string;
    description: string;
  };

  social: {
    youtube: string;
    instagram: string;
    github: string;
  };
};

const ProfileSchema = new Schema({
  user: {
    type: String,
    ref: 'user',
  },
  company: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
  },
  skills: {
    type: [String],
  },
  bio: {
    type: String,
  },
  githubUsername: {
    type: String,
  },
  experience: [
    {
      title: {
        type: String,
      },
      company: {
        type: String,
      },
      location: {
        type: String,
      },
      from: {
        type: String,
      },
      to: {
        type: String,
      },
      current: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
      },
      location: {
        type: String,
      },
      from: {
        type: String,
      },
      to: {
        type: String,
      },
      current: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
  social: [
    {
      youtube: {
        type: String,
      },
      instagram: {
        type: String,
      },
      github: {
        type: String,
      },
    },
  ],
});

export const Profile = mongoose.model<ProfileDocument>(
  'Profile',
  ProfileSchema
);
