function renderD3(){
  const chart = document.querySelector('.chart');
  const width = chart.offsetWidth;
  const height = window.innerHeight;
  let page = 1;
  const key = '81b9f73460ca6ea4ee1166f130832416';
  const smallPoster = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2'

  const svg = d3.select('.chart')
    .append('svg')
      .attr('height', height)
      .attr('width', width)
      .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);

  function getMovies(page){
    svg.selectAll('*').remove();
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=${page}`;
    d3.queue()
      .defer(d3.json, url)
      .await(ready);
  }

  const nextBtn = d3.select('.next')
    .on('click', () => {
      page++;
      getMovies(page);
    });

  const prevBtn = d3.select('.prev')
    .on('click', () => {
      if(page > 1){
        page--;
        getMovies(page);
      }
    });

  function ready(err, data){
    if(err) throw err;

    const children = data.results.map(movie => {
      return {
        id: movie.id,
        title: movie.title,
        popularity: movie.popularity,
        poster: smallPoster + movie.poster_path,
      };
    });

    const popularity = children.map(movie => {
      return movie.popularity;
    });

    const min = d3.min(popularity);
    const max = d3.max(popularity);

    const tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(function(d) { return `
        <p>
          <b>${d.title}</b>
          <br>
          <br>
          Popularity: ${d.popularity}
        </p>
        `  })
      svg.call(tool_tip)


    const defs = svg.append('defs');

    defs.selectAll('.movie-pattern')
      .data(children)
      .enter().append('pattern')
      .attr('class', '.artist-pattern')
      .attr('id', function (d){
        return d.title.toLowerCase().replace(/ /g, '-')
      })
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('patternContentUnits', 'objectBoundingBox')
      .append('image')
      .attr('height',1)
      .attr('width',1)
      .attr('preserveAspectRatio', 'none')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('xlink:href', function(d){
        return d.poster;
      });

    const circles = svg.selectAll(data.results.popularity)
      .data(children)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 0)
      .attr('fill', d => {
        return `url(#${d.title.toLowerCase().replace(/ /g, '-')})`
      })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide)
      .on('click', d => {
        console.log(d);
      });

    const radiousScale = d3.scaleSqrt().domain([min, max]).range([30, 100]);

    const simulation = d3.forceSimulation()
      .force('x', d3.forceX(0).strength(0.15))
      .force('y', d3.forceY(0).strength(1))
      .force('collide', d3.forceCollide(d => {
        return radiousScale(d.popularity)+2;
      }));

    const aniCircles = d3.selectAll('.node')

    aniCircles.transition()
      .duration(1500)
      .attr('r', d => {
        return radiousScale(d.popularity)
      });

    simulation.nodes(children).on('tick', ticked);

    function ticked(){
      circles
        .attr('cx', d => {
          return d.x;
        })
        .attr('cy', d => {
          return d.y;
        });
    }
  }
  getMovies(page);
}

renderD3();
