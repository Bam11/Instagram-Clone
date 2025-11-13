import React, { useEffect, useState } from 'react';
import type { post } from '~/lib/types';
import moment from 'moment';
import { useAuth } from '~/context/authContext';
import supabase from '~/lib/supabase';
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

type Like = {
  id: number;
  user_id: string;
  post_id: string;
}

type Comment = {
  id: number;
  user_id: string;
  post_id: string;
  comment_text: string;
  created_at: string;
  user_profile?: {
    username: string;
    image?: string;
  }[];
}

export default function PostCard({
  post, index
}: {
  post: post;
  index: number
}) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState<Like[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showAllComments, setShowAllComments] = useState(false)

  // fetch post likes count
  useEffect(() => {
    if (!post?.id || !user) return;

    let isMounted = true;

    (async () => {
      try {
        const { data, count, error } = await supabase
          .from("post_likes")
          .select("user_id, post_id, id", { count: "exact" })
          .eq("post_id", post.id);
        if (error) throw error;
        if (data && data.find((like) => like.user_id === user.id)) {
          setIsLiked(true);
        }
        if (isMounted) {
          setLikesCount(count ?? 0);
          console.log("data", data);
          setLikes(data || []);
        }
      } catch (err) {
        console.error("likes count error:", err);
      }
    })();

    const channel = supabase
      .channel(`post_likes${post.id}`)
      // .on(
      //   "postgres_changes",
      //   {
      //     event: "INSERT",
      //     schema: "public",
      //     table: "post_likes",
      //     filter: `post_id=eq.${post.id}`,
      //   },
      //   (_payload) => {
      //     // payload.new exists for INSERT
      //     setLikesCount((prev) => prev + 1);
      //     setLikes((prev) =>
      //       prev.find((l) => l.id === _payload.new?.id)
      //         ? prev
      //         : [...prev, _payload.new as Like]
      //     );
      //   }
      // )
      // .on(
      //   "postgres_changes",
      //   {
      //     event: "DELETE",
      //     schema: "public",
      //     table: "post_likes",
      //     filter: `post_id=eq.${post.id}`,
      //   },
      //   (payload) => {
      //     setLikesCount((prev) => Math.max(prev - 1, 0));
      //     setLikes((prev) => {
      //       return prev.filter((like) => like.id !== payload.old?.id);
      //     });
      //   }
      // )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${post.id}`,
        },
        async (_payload) => {
          const { count, error } = await supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          if (!error) {
            setLikesCount(count ?? 0);
          }
        }
      )

      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Optional: re-sync after (re)subscribe to avoid drift
          supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)
            .then(({ count }) => isMounted && setLikesCount(count ?? 0));
        }
      });

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [post.id]);

  // useEffect(() => {
  //   console.log("likes", likes);
  //   setLikesCount(likes.length);
  // }, [likes]);


  //fetch comments
  useEffect(() => {
    if (!post?.id) return;
    let isMounted = true;

    (async () => {
      try {
        const { data, count, error } = await supabase
          .from("post_comments")
          .select(
            "id, user_id, post_id, comment_text, created_at, user_profile( username, image)", { count: "exact" })
          .eq("post_id", post.id)
          .order("created_at", { ascending: false });
        if (!error && isMounted) {
          setCommentCount(count ?? 0);
          setComments(data || []);
        }
      } catch (err) {
        console.error("comments count error:", err);
      }
    })();

    const channel = supabase
      .channel(`post_comments${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${post.id}`,
        },
        async () => {
          const { data, count } = await supabase
            .from("post_comments")
            .select("id, user_id, post_id, comment_text, created_at, user_profile( username, image)", { count: "exact" })
            .eq("post_id", post.id)
            .order("created_at", { ascending: false });
          if (isMounted) {
            setComments(data || []);
            setCommentCount(count ?? 0);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [post.id]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Please log in to comment");

      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          comment_text: commentText.trim(),
        });

      if (error) throw error;

      setCommentText("");
    } catch (err) {
      console.error("handleAddComment error:", err)
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user?.id);
    if (error) console.error(error);
  };


  const handleLike = async () => {
    if (!user) return alert("Please login to like this post");

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        // console.log("Trying to unlike:", { postId: post.id, userId: user.id });
        // console.log("Unlike success");
        if (error) throw error;
        setIsLiked(false);
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: post.id,
            user_id: user.id,
          });

        if (error) throw error;
        setIsLiked(true);
      }
    } catch (error) {
      console.error(error);
    }
    // setIsLiked(!isLiked);
    // setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
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
        <div className="aspect-auto" onDoubleClick={handleLike}>
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
      <div className="py-3 px-2">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            <button className="outline-none focus:outline-none cursor-pointer" onClick={handleLike}>
              {isLiked ? (
                <FaHeart size={24} className="text-red-500" />
              ) : (
                <FaRegHeart size={24} className="" />
              )}
            </button>
            <button className="outline-none focus:outline-none cursor-pointer" >
              <FaRegComment size={24} className="" />
            </button>
            <button className="outline-none focus:outline-none cursor-pointer">
              <PiPaperPlaneTilt size={24} className="" />
            </button>
          </div>

          <button className="outline-none focus:outline-none cursor-pointer" onClick={handleSave}>
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

        {/* Recent Comments */}
        <div className="space-y-1 mb-2">
          {(showAllComments ? comments : comments.slice(-2)).map((comment) => (
            <div key={comment.id} className="flex items-center gap-2">
              {comment.user_profile?.image && (
                <img
                  src={comment.user_profile.image}
                  alt={comment.user_profile.username}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <p className="text-[14px]">
                <span className="font-semibold">
                  {comment.user_profile?.username || comment.user_id.slice(0, 6)}:
                </span>{" "}
                {comment.comment_text}
              </p>
            </div>
          ))}
        </div>


        {/* View comments */}
        {commentCount > 2 && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setShowAllComments((prev) => !prev)}
              className="text-[14px] text-[#8f8f8f] cursor-pointer"
            >
              {showAllComments
                ? "Hide comments"//will build a comment card
                : `View ${commentCount} comment`
              }
            </button>
          </div>
        )}

        {/* Add comment */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="add a comment..."
            className="w-full bg-transparent whitespace-normal text-[14px] placeholder-[#8f8f8f] outline-none focus:outline-none "
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value)
            }}
          />
          <div>
            {commentText.length > 0 ? (
              <div className="flex items-center gap-2">
                <p className="text-[#3143e3] text-sm font-[500] cursor-pointer hover:underline" onClick={handleAddComment}>
                  Post
                </p>
                <BsEmojiSmile className="text-[#8f8f8f] cursor-pointer" />
              </div>
            )
              :
              <BsEmojiSmile className="text-[#8f8f8f] cursor-pointer" />
            }
          </div>
        </div>
      </div>
      <hr className="text-[#dbdbdb]" />
    </div>
  )
}
