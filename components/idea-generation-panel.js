(function(){
  var post_json, load_css_file, ref$, get_enabled_goals, get_goals, unique, msg, polymer_ext, fetchjson, postjson;
  post_json = require('libs_backend/ajax_utils').post_json;
  load_css_file = require('libs_common/content_script_utils').load_css_file;
  ref$ = require('libs_backend/goal_utils'), get_enabled_goals = ref$.get_enabled_goals, get_goals = ref$.get_goals;
  unique = require('libs_common/array_utils').unique;
  msg = require('libs_common/localization_utils').msg;
  polymer_ext = require('libs_frontend/polymer_utils').polymer_ext;
  fetchjson = async function(url){
    var logging_server_url, this$ = this;
    if (localStorage.getItem('local_logging_server') === 'true') {
      logging_server_url = 'http://localhost:5000/';
    } else {
      logging_server_url = 'https://habitlab.herokuapp.com/';
    }
    return (await fetch(logging_server_url + url).then(function(it){
      return it.json();
    }));
  };
  postjson = async function(url, data){
    var logging_server_url, this$ = this;
    if (localStorage.getItem('local_logging_server') === 'true') {
      logging_server_url = 'http://localhost:5000/';
    } else {
      logging_server_url = 'https://habitlab.herokuapp.com/';
    }
    return (await post_json(logging_server_url + url).then(function(it){
      return it.json();
    }));
  };
  polymer_ext({
    is: 'idea-generation-panel',
    properties: {
      index_background_color: {
        type: String,
        value: 'rgb(81, 167,249)'
      },
      sites_list: {
        type: Array
      },
      site_ideas_mapping: {
        type: Array,
        value: []
      },
      site_ideas_mapping_counter: {
        type: Array,
        value: []
      },
      current_site: {
        type: String,
        value: ''
      },
      current_left_idea_id: {
        type: String,
        value: ''
      },
      current_right_idea_id: {
        type: String,
        value: ''
      }
    },
    inject_site_ideas_mapping: async function(site_list){
      var ideas_placeholder, i$, len$, site, lresult$, j$, len1$, idea, site_idea_pair, data, upload_successful, response, e, results$ = [];
      if (site_list == null) {
        site_list = this.site_list;
      }
      ideas_placeholder = ['placeholder_1', 'placeholder_2', 'placeholder_3', 'placeholder_4', 'placeholder_5', 'placeholder_6'];
      for (i$ = 0, len$ = site_list.length; i$ < len$; ++i$) {
        site = site_list[i$];
        lresult$ = [];
        for (j$ = 0, len1$ = ideas_placeholder.length; j$ < len1$; ++j$) {
          idea = ideas_placeholder[j$];
          site_idea_pair = {
            site: site,
            idea: idea,
            vote: 0
          };
          console.log(site_idea_pair);
          data = import$({}, site_idea_pair);
          upload_successful = true;
          try {
            console.log('Posting data to: postideas');
            response = (await postjson('postideas', data));
            if (response.success) {
              lresult$.push(dlog('success'));
            } else {
              upload_successful = false;
              dlog('response from server was not successful in postideas');
              dlog(response);
              dlog(data);
              lresult$.push(console.log('response from server was not successful in postideas'));
            }
          } catch (e$) {
            e = e$;
            upload_successful = false;
            dlog('error thrown in postideas');
            dlog(e);
            dlog(data);
            lresult$.push(console.log('error thrown in postideas'));
          }
        }
        results$.push(lresult$);
      }
      return results$;
    },
    upvote_idea: async function(option){
      var self, upvote_idea, data;
      self = this;
      upvote_idea = '';
      if (option === 'right') {
        upvote_idea = self.current_right_idea_id;
      } else {
        upvote_idea = self.current_left_idea_id;
      }
      console.log("Upvoting website: " + self.current_site + " for idea: " + upvote_idea + ".");
      data = (await fetchjson('upvote_proposed_idea?idea_id=' + upvote_idea));
      return console.log(data);
    },
    select_answer_leftside: async function(evt){
      var self;
      self = this;
      if (this.animation_inprogress) {
        return;
      }
      (await self.upvote_idea('left'));
      this.SM('.animate_left').css("filter", "grayscale(0%)");
      this.SM('.animate_left').css("background-color", "#0000FF");
      this.$$('.animate_left').innerText = this.$$('.fix_left').innerText;
      this.SM('.answer-leftside-animate').css("margin-top", '0');
      this.SM('.answer-leftside-animate').css("z-index", '1');
      this.SM('.answer-leftside-fix').css("z-index", '0');
      this.SM('.answer-leftside-animate').animate({
        marginTop: '+120px'
      }, 1000);
      this.SM('.animate_right').css("background-color", "#0000FF");
      this.SM('.animate_right').css("filter", "grayscale(30%)");
      this.$$('.animate_right').innerText = this.$$('.fix_right').innerText;
      this.SM('.answer-rightside-animate').css("margin-top", '0');
      this.SM('.answer-rightside-animate').css("z-index", '1');
      this.SM('.answer-rightside-fix').css("z-index", '0');
      this.SM('.answer-rightside-animate').animate({
        marginTop: '+120px'
      }, 1000);
      (await self.display_idea());
      this.animation_inprogress = true;
      return setTimeout(function(){
        return self.animation_inprogress = false;
      }, 1000);
    },
    select_answer_rightside: async function(evt){
      var self;
      self = this;
      if (this.animation_inprogress) {
        return;
      }
      (await self.upvote_idea('right'));
      this.SM('.animate_right').css("filter", "grayscale(0%)");
      this.SM('.animate_right').css("background-color", "#0000FF");
      this.$$('.animate_right').innerText = this.$$('.fix_right').innerText;
      this.SM('.answer-rightside-animate').css("margin-top", '0');
      this.SM('.answer-rightside-animate').css("z-index", '1');
      this.SM('.answer-rightside-fix').css("z-index", '0');
      this.SM('.answer-rightside-animate').animate({
        marginTop: '+120px'
      }, 1000);
      this.SM('.animate_left').css("background-color", "#0000FF");
      this.SM('.animate_left').css("filter", "grayscale(30%)");
      this.$$('.animate_left').innerText = this.$$('.fix_left').innerText;
      this.SM('.answer-leftside-animate').css("margin-top", '0');
      this.SM('.answer-leftside-animate').css("z-index", '1');
      this.SM('.answer-leftside-fix').css("z-index", '0');
      this.SM('.answer-leftside-animate').animate({
        marginTop: '+120px'
      }, 1000);
      (await self.display_idea());
      this.animation_inprogress = true;
      return setTimeout(function(){
        return self.animation_inprogress = false;
      }, 1000);
    },
    select_opt_out: async function(evt){
      var self;
      self = this;
      if (this.animation_inprogress) {
        return;
      }
      this.SM('.animate_right').css("filter", "grayscale(30%)");
      this.SM('.animate_right').css("background-color", "#0000FF");
      this.$$('.animate_right').innerText = this.$$('.fix_right').innerText;
      this.SM('.answer-rightside-animate').css("margin-top", '0');
      this.SM('.answer-rightside-animate').css("z-index", '1');
      this.SM('.answer-rightside-fix').css("z-index", '0');
      this.SM('.answer-rightside-animate').animate({
        marginTop: '+120px'
      }, 1000);
      this.SM('.animate_left').css("filter", "grayscale(30%)");
      this.SM('.animate_left').css("background-color", "#0000FF");
      this.$$('.animate_left').innerText = this.$$('.fix_left').innerText;
      this.SM('.answer-leftside-animate').css("margin-top", '0');
      this.SM('.answer-leftside-animate').css("z-index", '1');
      this.SM('.answer-leftside-fix').css("z-index", '0');
      this.SM('.answer-leftside-animate').animate({
        marginTop: '+120px'
      }, 1000);
      (await self.display_idea());
      this.animation_inprogress = true;
      return setTimeout(function(){
        return self.animation_inprogress = false;
      }, 1000);
    },
    user_typing_idea: function(evt){
      return this.idea_text = this.$$('#nudge_typing_area').value;
    },
    add_own_idea: function(){
      this.$$('#add_idea_dialog').open();
      if (this.idea_text != null && this.idea_text.length > 0) {
        return this.$$('#nudge_typing_area').value = this.idea_text;
      }
    },
    submit_idea: async function(){
      var idea_site, idea_text, site_idea_pair, data, upload_successful, response, e;
      idea_site = this.$$('#idea_site_selector').selected;
      idea_site = this.sites_list[idea_site];
      idea_text = this.$$('#nudge_typing_area').value;
      this.$$('#nudge_typing_area').value = '';
      this.idea_text = '';
      site_idea_pair = {
        site: idea_site,
        idea: idea_text
      };
      console.log(site_idea_pair);
      data = import$({}, site_idea_pair);
      console.log(data);
      upload_successful = true;
      try {
        response = (await postjson('postidea_candidate', data));
        if (response.success) {
          dlog('success');
        } else {
          upload_successful = false;
          dlog('response from server was not successful in postidea_candidate');
          dlog(response);
          dlog(data);
          console.log('response from server was not successful in postidea_candidate');
        }
      } catch (e$) {
        e = e$;
        upload_successful = false;
        dlog('error thrown in postidea_candidate');
        dlog(e);
        dlog(data);
        console.log('error thrown in postidea_candidate');
      }
      return this.$$('#add_idea_dialog').close();
    },
    display_idea: async function(){
      var self, all_goals, i$, ref$, len$, site_ideas_pair, j$, ref1$, len1$, site_counter_pair, index;
      self = this;
      all_goals = (await get_goals());
      for (i$ = 0, len$ = (ref$ = self.site_ideas_mapping).length; i$ < len$; ++i$) {
        site_ideas_pair = ref$[i$];
        for (j$ = 0, len1$ = (ref1$ = self.site_ideas_mapping_counter).length; j$ < len1$; ++j$) {
          site_counter_pair = ref1$[j$];
          if (site_ideas_pair.goal === site_counter_pair.goal) {
            if (site_counter_pair.counter < site_ideas_pair.ideas.length / 2) {
              self.$$('.vote-question').innerText = msg("Which do you think would be a better nudge for " + all_goals[site_ideas_pair.goal].sitename_printable + " ?");
              self.current_site = site_ideas_pair.goal;
              index = site_counter_pair.counter * 2;
              if (site_counter_pair.counter === Math.floor(site_ideas_pair.ideas.length / 2)) {
                self.$$('.fix_left').innerText = msg(site_ideas_pair.ideas[index]);
                self.$$('.fix_right').innerText = msg(site_ideas_pair.ideas[0]);
                self.current_left_idea_id = site_ideas_pair.ideas_id[index];
                self.current_right_idea_id = site_ideas_pair.ideas_id[0];
              } else {
                self.$$('.fix_left').innerText = msg(site_ideas_pair.ideas[index]);
                self.$$('.fix_right').innerText = msg(site_ideas_pair.ideas[index + 1]);
                self.current_left_idea_id = site_ideas_pair.ideas_id[index];
                self.current_right_idea_id = site_ideas_pair.ideas_id[index + 1];
              }
              site_counter_pair.counter = site_counter_pair.counter + 1;
              return;
            }
          }
        }
      }
      document.getElementById("disable_left").disabled = true;
      document.getElementById("disable_right").disabled = true;
      return document.getElementById("disable_opt_out").disabled = true;
    },
    ready: async function(){
      var self, all_goals, goal_info_list, goals_list, enabled_goals, allideas, goal_to_idea_info, i$, len$, idea_info, goal, site_ideas_mapping, site_ideas_mapping_counter, idea_temp, idea_id_temp, idea_info_list, j$, len1$, this$ = this;
      self = this;
      all_goals = (await get_goals());
      goal_info_list = Object.values(all_goals);
      self.goal_info_list = goal_info_list;
      goals_list = goal_info_list.map(function(it){
        return it.name;
      });
      enabled_goals = (await get_enabled_goals());
      allideas = (await fetchjson('getideas_vote_all'));
      goal_to_idea_info = {};
      for (i$ = 0, len$ = allideas.length; i$ < len$; ++i$) {
        idea_info = allideas[i$];
        goal = idea_info.goal;
        if (goal_to_idea_info[goal] == null) {
          goal_to_idea_info[goal] = [];
        }
        goal_to_idea_info[goal].push(idea_info);
      }
      console.log(allideas);
      site_ideas_mapping = [];
      site_ideas_mapping_counter = [];
      for (i$ = 0, len$ = goals_list.length; i$ < len$; ++i$) {
        goal = goals_list[i$];
        idea_temp = [];
        idea_id_temp = [];
        idea_info_list = goal_to_idea_info[goal];
        if (idea_info_list != null) {
          for (j$ = 0, len1$ = idea_info_list.length; j$ < len1$; ++j$) {
            idea_info = idea_info_list[j$];
            idea_temp.push(idea_info.idea);
            idea_id_temp.push(idea_info._id);
          }
        }
        site_ideas_mapping.push({
          goal: goal,
          ideas: idea_temp,
          ideas_id: idea_id_temp,
          counter: 0
        });
        site_ideas_mapping_counter.push({
          goal: goal,
          counter: 0
        });
      }
      self.site_ideas_mapping = site_ideas_mapping;
      self.site_ideas_mapping_counter = site_ideas_mapping_counter;
      return (await self.display_idea());
    },
    oldready: async function(){
      var self, all_goals, goal_info_list, sites_list, enabled_goals, enabled_goals_keys, enabled_spend_less_site, i$, len$, item, site, site_upper, data, idea_temp, idea_id_temp, j$, len1$, this$ = this;
      self = this;
      all_goals = (await get_goals());
      goal_info_list = Object.values(all_goals);
      sites_list = goal_info_list.map(function(it){
        return it.sitename_printable;
      });
      sites_list = sites_list.filter(function(it){
        return it != null;
      });
      sites_list = unique(sites_list);
      sites_list.sort();
      this.sites_list = sites_list;
      enabled_goals = (await get_enabled_goals());
      enabled_goals_keys = Object.keys(enabled_goals);
      enabled_spend_less_site = [];
      for (i$ = 0, len$ = enabled_goals_keys.length; i$ < len$; ++i$) {
        item = enabled_goals_keys[i$];
        enabled_spend_less_site.push(item.split("/")[0]);
      }
      console.log(enabled_spend_less_site);
      for (i$ = 0, len$ = enabled_spend_less_site.length; i$ < len$; ++i$) {
        site = enabled_spend_less_site[i$];
        site_upper = site.charAt(0).toUpperCase() + site.slice(1);
        console.log("Fetching from the server of shared interventions from: " + site_upper);
        data = (await fetchjson('getideas_vote?website=' + site_upper));
        idea_temp = [];
        idea_id_temp = [];
        for (j$ = 0, len1$ = data.length; j$ < len1$; ++j$) {
          item = data[j$];
          idea_temp.push(item.idea);
          idea_id_temp.push(item._id);
        }
        self.site_ideas_mapping.push({
          site: site,
          ideas: idea_temp,
          ideas_id: idea_id_temp,
          counter: 0
        });
        self.site_ideas_mapping_counter.push({
          site: site,
          counter: 0
        });
      }
      return (await self.display_idea());
    }
  }, [
    {
      source: require('libs_common/localization_utils'),
      methods: ['msg']
    }, {
      source: require('libs_frontend/polymer_methods'),
      methods: ['text_if', 'once_available', 'S', 'SM']
    }, {
      source: require('libs_frontend/polymer_methods_resize'),
      methods: ['on_resize']
    }
  ]);
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
