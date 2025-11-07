import React, { useState } from 'react';
import type { post } from '~/lib/types';
import { BsEmojiSmile } from 'react-icons/bs';
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaBookmark,
  FaRegBookmark
} from 'react-icons/fa';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { PiPaperPlaneTilt } from 'react-icons/pi';
import moment from 'moment';
import { useAuth } from '~/context/authContext';

export default function PostCard({
  post, index
}: {
  post: post;
  index: number
}) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };


  const handleSave = () => {
    setIsSaved(!isSaved);
  };



  return (
    <div className="max-w-[470px] w-full mx-auto mb-5">
      <div className="flex items-center justify-between">
        {/*Post Header*/}
        <div className="flex items-center gap-3 pl-1 pb-3">
          <img
            src={post.author.image}///"images/rcf_funaab.jpg" 
            alt={post.author.username}//"rcf" 
            className="size-9 rounded-full"
          />
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-[14px] font-bold">{post.author.username}</h3>
              <div className="size-[2px] bg-[#a6a6a6]"></div>
              <p className="text-sm text-gray-400 -mb-0.5">
                {moment(post.created_at).fromNow()}
              </p>
            </div>
            {/* <p className="text-[12px]">Redemption City, Isolu, Alabata.</p> */}
          </div>
        </div>
        <button>
          <IoEllipsisHorizontal />
        </button>
      </div>

      <div className="border border-[#dbdbdb] rounded-sm">
        <div className="aspect-auto">
          {post.media_type === "video" ? (
            <div className="w-full h-full">
              <video
                src={post.media}
                className="w-full h-full object-cover cursor-pointer"
                preload="metadata"
              >
                Video not supported by your
              </video>
            </div>
          ) : (
            <img
              className="w-full h-full object-cover cursor-pointer"
              alt="post"
              src={post.media}//"images/post.jpg"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Post Footer */}
      <div className="py-3 ">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            <button className="outline-none focus:outline-none" onClick={handleLike}>
              {isLiked ? (
                <FaHeart size={24} className="text-red-500" />
              ) : (
                <FaRegHeart size={24} className="" />
              )}
            </button>
            <button className="outline-none focus:outline-none">
              <FaRegComment size={24} className="" />
            </button>
            <button className="outline-none focus:outline-none">
              <PiPaperPlaneTilt size={24} className="" />
            </button>
          </div>

          <button className="outline-none focus:outline-none" onClick={handleSave}>
            {isSaved ? (
              <FaBookmark size={24} className="dark:text-white" />
            ) : (
              <FaRegBookmark size={24} className="dark:text-white" />
            )}
          </button>
        </div>

        {/* Likes count */}
        <div className="mb-2">
          <p className="text-[13px] font-semibold cursor-pointer dark:text-white">
            {likesCount} likes
          </p>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <p className="text-[13px] dark:text-white"> {/*text elipse incase later */}
            <span className="font-semibold mr-2 cursor-pointer">
              {post.author.username}
            </span>
            {post.caption}
          </p>
        </div>

        {/* View comments */}
        <div className="mb-2">
          <button className="text-[14px] text-[#8f8f8f] cursor-pointer">
            View 1 comment
          </button>
        </div>

        {/* Add comment */}
        <div className="flex items-center justify-between">
          <input type="text" placeholder="add a comment..." className="w-full bg-transparent whitespace-normal text-[14px] placeholder-[#8f8f8f] outline-none focus:outline-none "
            value={
              // commentText 
              ""
            }
            onChange={(e) => {
              // setCommentText(e.target.value)
            }}
          />
          <div>
            <BsEmojiSmile className="text-[#8f8f8f] cursor-pointer" />
          </div>
        </div>
      </div>
      <hr className="text-[#dbdbdb]" />
    </div>
  )
}
