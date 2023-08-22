const youtube = "UCwiCyswBHPe50z7yGkDSDqw";
const api_key = "AIzaSyAdHUHi4xwh9WQXOW5PyeoRtOAIkaqh-AY";

// let test = () => {
//     fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtube}&key=${api_key}&maxResults=20&order=date`)
//         .then(response => {
//             return response.json();
//         })
//         .then(data => {
//             console.log(data)
//         })
// }
var channelId = ""
// costumeUrl = "https://www.youtube.com/@Nourmar5"
// let test = () => {
//     fetch(`https://www.googleapis.com/youtube/v3/search?q=${costumeUrl}&key=${api_key}&part=snippet&type=channel&maxResults=1`)
//         .then(response => {
//             return response.json();
//         })
//         .then(data => {
//             console.log(data)
//             channelId = data.items[0].id.channelId
//         })
// }
// test()

function parseYouTubeDurationToMilliseconds(duration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);

    const hours = parseInt(matches[1] || 0);
    const minutes = parseInt(matches[2] || 0);
    const seconds = parseInt(matches[3] || 0);

    const totalMilliseconds = hours * 3600000 + minutes * 60000 + seconds * 1000;
    return totalMilliseconds;
}






var input = document.querySelector(".url")
var get_id = document.querySelector(".get_id")
var test1 = document.querySelector(".test1")
var PLAYLIST_ID;
get_id.addEventListener("click", () => {
    let test = () => {
        fetch(`https://www.googleapis.com/youtube/v3/search?q=${input.value}&key=${api_key}&part=snippet&type=channel&maxResults=1`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data)
                channelId = data.items[0].id.channelId
                PLAYLIST_ID = 'UU' + channelId.slice(2);
            })
    }
    test()

    // const test1 = document.querySelector(".test1")
    test1.addEventListener("click", () => {
        // console.log(PLAYLIST_ID)
        ids()
    })

})



let test = () => {
    // Return the fetch Promise
    return fetch(`https://www.googleapis.com/youtube/v3/search?q=${input.value}&key=${api_key}&part=snippet&type=channel&maxResults=1`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
            channelId = data.items[0].id.channelId;
            PLAYLIST_ID = 'UU' + channelId.slice(2);
        });
};


let ids = () => {
    return new Promise((resolve, reject) => {
        // https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId={PLAYLIST_ID}&maxResults=50&key={API_KEY}'
        // https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtube}&key=${api_key}&maxResults=15&order=date
        resolve(fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=50&key=${api_key}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                var arr = [];
                // const today = new Date();
                // today.setMonth(today.getMonth() - 1)
                // var dateString = today.getFullYear() + "-" + "0" + (today.getMonth() + 1) + "-" + today.getDate() + "T00:00:00Z";
                console.log(data)
                // console.log(dateString)
                const today = new Date();
                today.setMonth(today.getMonth() - 1);
                const dateString = today.toISOString(); // This gives you the formatted date string
                console.log(dateString)

                // "2023-07-01T11:18:56Z"
                for (var i = 0; i < data.items.length; i++) {
                    if (data.items[i].snippet.publishedAt > dateString /*"2023-07-08T00:00:00Z"/*today.getFullYear() + "-" + 0 + today.getMonth() + "-" + today.getDay()*/) {
                        arr.push(data.items[i].snippet.resourceId.videoId);
                        console.log(data.items[i].snippet.title + data.items[i].snippet.resourceId.videoId)

                    }
                }

                console.log(arr);
                return arr; // Return the array of video IDs to continue the promise chain.
            })
            .then(videoIds => {
                // Now we can call the video function to filter video IDs based on duration.
                console.log(videoIds)
                return video(videoIds);
            })
        )
    });
}


const fetchVideoData = (video_id) => {
    return fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&statistics&id=${video_id}&key=${api_key}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const videoDuration = data.items[0].contentDetails.duration;
            const durationInMilliseconds = parseYouTubeDurationToMilliseconds(videoDuration);
            if (durationInMilliseconds > 90000 && durationInMilliseconds < 3600000) {
                console.log(data.items[0].id)
                return data.items[0].id;
            }
            return null;
        })
        .catch(error => {
            console.error(error);
            return null;
        });
};


const video = (arr) => {
    return Promise.all(arr.map(fetchVideoData))
        .then(videoIds => {
            const filteredVideoIds = videoIds.filter(videoId => videoId !== null);
            // console.log(filteredVideoIds);
            return filteredVideoIds;
        });
};




const avg = document.querySelector(".avg")



avg.addEventListener("click", async () => {
    try {
        // Wait for the test() function to complete
        await test();

        // Now, proceed with the ids() function
        const data = await ids();
        const filteredVideoIds = await video(data);

        const fetchVideoData = async (video_id) => {
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${video_id}&key=${api_key}`);
                const data = await response.json();
                const views_f = parseInt(data.items[0].statistics.viewCount);
                return views_f;
            } catch (error) {
                console.error(error);
                return 0;
            }
        };

        const calculateAverageViews = async (videoIds) => {
            let totalViews = 0;
            const existingAverage = document.querySelector("h1");
            if (existingAverage) {
                existingAverage.remove();
            }
            const average = document.createElement("h1");
            for (let i = 0; i < videoIds.length; i++) {
                const video_id = videoIds[i];
                const views = await fetchVideoData(video_id);
                totalViews += views;
            }

            const averageViews = totalViews / videoIds.length;
            document.body.appendChild(average);
            average.innerHTML = Math.round(averageViews);
        };

        calculateAverageViews(filteredVideoIds);
        console.log(filteredVideoIds);
    } catch (error) {
        console.error(error);
    }
});





// avg.addEventListener("click", () => {
//     get_id().then()
//     ids()
//         .then(data => video(data))
//         .then(filteredVideoIds => {
//             const fetchVideoData = async (video_id) => {
//                 try {
//                     const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${video_id}&key=${api_key}`);
//                     const data = await response.json();
//                     const views_f = parseInt(data.items[0].statistics.viewCount);
//                     return views_f;
//                 } catch (error) {
//                     console.error(error);
//                     return 0;
//                 }
//             };
//             const calculateAverageViews = async (videoIds) => {
//                 let totalViews = 0;
//                 const existingAverage = document.querySelector("h1");
//                 if (existingAverage) {
//                     existingAverage.remove();
//                 }
//                 const average = document.createElement("h1")
//                 for (let i = 0; i < videoIds.length; i++) {
//                     const video_id = videoIds[i];
//                     const views = await fetchVideoData(video_id);
//                     totalViews += views;
//                 }

//                 const averageViews = totalViews / videoIds.length;
//                 document.body.appendChild(average);
//                 average.innerHTML = Math.round(averageViews);
//             };

//             calculateAverageViews(filteredVideoIds);
//             console.log(filteredVideoIds)
//             // The filteredVideoIds will contain the result from the video function.
//             // You can now use the filteredVideoIds array here or perform further actions.
//         })
//         .catch(error => {
//             console.error(error);
//         });

// })

// base code for getting id from url///////////////////////////////////////////////////////////////////////////////////////////////////////////////////





