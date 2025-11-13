import axiosClient from './axiosClient';

export const getReviewsByTour = async (tourId) => {
  const res = await axiosClient.get(`/tours/${tourId}/reviews`);
  return res.data.data.doc; // expecting { data: { doc: [...] } }
};
