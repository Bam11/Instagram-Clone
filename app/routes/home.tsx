import type { Route } from "./+types/home";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "~/context/authContext";
import { cn } from "~/lib/utils";
import supabase from "~/lib/supabase";
import PostCard from "~/components/PostCard";
import type { post } from "~/lib/types";
import { FaCircleChevronRight } from "react-icons/fa6";



export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Instagram Clone" },
    { name: "Instagram", content: "Welcome to my Instagram Clone Application" },
  ];
}

const userStories = [...Array(20)];

export default function Home() {
  const { user, handleLogout, isAuthLoading } = useAuth();
  const [showLeftArrow, setshowLeftArrow] = useState(false);
  const [showRightArrow, setshowRightArrow] = useState(true);
  const userStoriesRef = useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<post[]>([]);
  const [newPostAvailable, setNewPostAvailable] = useState(false);
  const [refetchingPost, setRefectingPost] = useState(false);

  // fetch posts
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("post")
          // .select("*, ic_post_collaborators(*)")
          .select("*, author:user_profile!post_author_id_fkey1(*)")
          .order("created_at", { ascending: false });
        error && console.log(error);
        if (data) {
          console.log(data);
          setPosts(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();

    const subscription = supabase
      .channel("ic_posts_insert")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post" },
        (payload) => {
          console.log("Change received!", payload);
          if (payload.new) {
            setNewPostAvailable(true);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const reFetchPosts = async () => {
    setRefectingPost(true);
    try {
      const { data, error } = await supabase
        .from("post")
        // .select("*, ic_post_collaborators(*)")
        .select("*, author:ic_users!ic_posts_author_id_fkey1(*)")
        .order("created_at", { ascending: false });
      error && console.log(error);
      if (data) {
        // console.log(data);
        setPosts(data);
        setNewPostAvailable(false);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setRefectingPost(false);
    }
  };

  const handleScrollLeft = () => {
    const userStories = userStoriesRef.current;
    if (userStories && userStories.scrollLeft) userStories.scrollLeft -= 356;
  };

  const handleScrollRight = () => {
    const userStories = document.getElementById("user-stories");
    if (userStories) userStories.scrollLeft += 356;
  };

  useEffect(() => {
    const handleScroll = () => {
      const element = userStoriesRef.current;
      if (element) {
        setshowLeftArrow(element.scrollLeft > 0);
        setshowRightArrow(
          element.scrollLeft !== element.scrollWidth - element.clientWidth
        );
      }
    };

    const element = userStoriesRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);

      return () => {
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };


  if (!user) return null;


  return (
    <main className="h-screen overflow-auto flex justify-center gap-14 w-full items-stretch">
      <div className="max-w-[630px] w-full mt-4">
        <div className="relative group mb-6">
          <div
            ref={userStoriesRef}
            id="user-stories"
            className="w-full py-2 px-[9px] flex items-center gap-4 max-w-[630px] overflow-x-auto scroll-smooth">
            {userStories.map((_, index) => (
              <div className="flex flex-col justify-center item-center" key={index}>
                <div className="size-[89px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-1 select-none">
                  <img src={
                    (index + 1) % 2 === 0
                      ? "images/daniel.jpg"
                      : "images/wicker.jpg"
                  }
                    alt=""
                    className="size-full rounded-full bg-[#fff] border-2 border-[#fff]"
                  />
                </div>
                <p className="text-[12px] text-center font-semi-bold text-[#5e5e5e]">
                  {(index + 1) % 2 === 0 ? "daniel_diran" : "wickerfurniture"}
                </p>
              </div>
            ))}
          </div>

          <div onClick={handleScrollLeft}
            className={cn("absolute left-3 top-[35%] rotate-180 cursor-pointer select-none transition-all duration-300 ", showLeftArrow
              ? "group-hover: opacity-100"
              : "opacity-0 pointer-events-none"
            )}
          >
            <FaCircleChevronRight size={28} className="text-[#fff]" />
          </div>
          <div onClick={handleScrollRight}
            className={cn("absolute right-3 top-[35%] cursor-pointer select-none transition-all duration-300", showRightArrow
              ? "group-hover: opacity-100"
              : "opacity-0 pointer-events-none"
            )}
          >
            <FaCircleChevronRight size={28} className="text-[#fff]" />
          </div>
        </div>

        <div className="">

          <div
            className="max-w-[470px] w-full mx-auto mb-5"
          >
            {posts.map((post, index) => (
              <PostCard key={index} post={post} index={index} />
            ))}

          </div>
        </div>

        {/**Old postcard */}
        {/* <div className="max-w-[470px] w-full mx-auto mb-5">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-3 pl-1 pb-3">
                <img src="images/rcf_funaab.jpg" alt="rcf" className="size-9 rounded-full" />
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] font-bold">rcf_funaab</h3>
                    <div className="size-[2px] bg-[#a6a6a6]"></div>
                    <p className="text-sm text-gray-400 -mb-0.5">1d</p>
                  </div>
                  <p className="text-[12px]">Redemption City, Isolu, Alabata.</p>
                </div>
              </div>
              <button>
                <IoEllipsisHorizontal />
              </button>
            </div>

            <div className="border border-[#dbdbdb] rounded-sm">
              <div className="aspect-auto">
                <img className="w-full h-full object-cover" src="images/post.jpg" alt="post" />
              </div>
            </div>

            
            <div className="py-3 ">
              
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

              
              <div className="mb-2">
                <p className="text-[13px] font-semibold cursor-pointer dark:text-white">
                  {likesCount} likes
                </p>
              </div>

              
              <div className="mb-2">
                <p className="text-[13px] dark:text-white">
                  <span className="font-semibold mr-2 cursor-pointer">rcf_funaab</span> A spiritual awakening that has imprinted eternity in our hearts....
                </p>
                <p className="text-[14px] text-[#8f8f8f] cursor-pointer">more</p>
              </div>

              
              <div className="mb-2">
                <button className="text-[14px] text-[#8f8f8f] cursor-pointer">
                  View 1 comment
                </button>
              </div>

              
              <div className="flex items-center justify-between">
                <input type="text" placeholder="add a comment..." className="w-full bg-transparent whitespace-normal text-[14px] placeholder-[#8f8f8f] outline-none focus:outline-none " />
                <div>
                  <BsEmojiSmile className="text-[#8f8f8f] cursor-pointer" />
                </div>
              </div>
            </div>
            <hr className="text-[#dbdbdb]" />
          </div> */}

      </div>

      <div className="right mt-9 w-[320px]">
        <div className="px-4 space-y-6">
          {/*UserProfile Section*/}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-500">
                <img loading="lazy"
                  src={user.user_metadata.image}
                  alt={user.user_metadata.fullName}
                  className="size-full rounded-full"
                />
              </div>
              <div className="">
                <p className="text-[14px] font-semibold dark:text-white">{user.user_metadata.fullName}</p>
                <p className="text-[12px] font-semibold text-[#8f8f8f]">{user.user_metadata.username}</p>
              </div>
            </div>
            <button className="text-[12px] text-[#3040d2] font-semibold cursor-pointer hover:underline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          {/*Suggested Profiles*/}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#8f8f8f]">Suggested for you</h3>
              <button className="text-[12px] font-semibold hover:text-[#8f8f8f]">See All</button>
            </div>
          </div>
        </div>
      </div>
    </main>

  );
}
