/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
function Feed() {
  // const [posts, setPosts] = useState([]);

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     const response = await axios.get(
  //       "http://localhost:5000/api/post/allPosts",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsImVtYWlsIjoiYi0yOUBnbWFpbC5jb20iLCJuZWlnaGJvcmhvb2RfaWQiOjMsImlhdCI6MTc1NzQzNTIzOCwiZXhwIjoxNzU3NDM4ODM4fQ.bUs401SBUiuQIA86rdC7LoWQXK3wTVFZ6xDxd_nEezg`}`,
  //         },
  //       }
  //     );
  //     setPosts(response.data.posts);
  //     console.log(response.data.posts);
  //   };
  //   fetchPosts();
  // }, []);

  return <>Feed</>;
}

export default Feed;
