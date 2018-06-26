(function(){
  var ref$, gexport, gexport_module, as_array, bandits, get_seconds_spent_on_domain_for_each_session_per_intervention, list_enabled_interventions_for_goal, get_goals, train_multi_armed_bandit_for_data, get_next_intervention_to_test_for_data, train_multi_armed_bandit_for_goal, get_next_intervention_to_test_for_goal, intervention_utils, intervention_manager, goal_progress, __get__, __set__, out$ = typeof exports != 'undefined' && exports || this;
  ref$ = require('libs_common/gexport'), gexport = ref$.gexport, gexport_module = ref$.gexport_module;
  as_array = require('libs_common/collection_utils').as_array;
  bandits = require('percipio').bandits;
  ref$ = require('libs_backend/intervention_utils'), get_seconds_spent_on_domain_for_each_session_per_intervention = ref$.get_seconds_spent_on_domain_for_each_session_per_intervention, list_enabled_interventions_for_goal = ref$.list_enabled_interventions_for_goal;
  get_goals = require('libs_backend/goal_utils').get_goals;
  /*
  to_training_data_for_single_intervention = (list_of_seconds_spent) ->
    # input: dictionary of day => number of seconds spent on FB
    # output: list of rewards (between 0 to 1). 0 = all day spent on FB, 1 = no time spent on FB
    list_of_seconds_spent = as_array list_of_seconds_spent
    output = []
    normalizing_value = Math.log(24*3600)
    for x in list_of_seconds_spent
      log_seconds_spent_normalized = Math.log(x) / normalizing_value
      output.push(1.0 - log_seconds_spent_normalized)
    return output
  
  to_training_data_for_all_interventions = (intervention_to_seconds_spent) ->
    output = {}
    for k,seconds_sepnt of intervention_to_seconds_spent
      output[k] = to_training_data_for_single_intervention seconds_spent
    return output
  */
  out$.train_multi_armed_bandit_for_data = train_multi_armed_bandit_for_data = function(data_list, intervention_names){
    var bandit_arms, bandit_arms_dict, intervention_name_to_arm, i$, len$, idx, intervention_name, arm, predictor, ref$, intervention, reward;
    bandit_arms = [];
    bandit_arms_dict = {};
    intervention_name_to_arm = {};
    for (i$ = 0, len$ = intervention_names.length; i$ < len$; ++i$) {
      idx = i$;
      intervention_name = intervention_names[i$];
      arm = bandits.createArm(idx, intervention_name);
      bandit_arms.push(arm);
      bandit_arms_dict[intervention_name] = arm;
      intervention_name_to_arm[intervention_name] = arm;
    }
    predictor = bandits.Predictor(bandit_arms);
    for (i$ = 0, len$ = data_list.length; i$ < len$; ++i$) {
      ref$ = data_list[i$], intervention = ref$.intervention, reward = ref$.reward;
      arm = intervention_name_to_arm[intervention];
      predictor.learn(arm, reward);
    }
    predictor.arms_list = bandit_arms;
    predictor.arms = bandit_arms_dict;
    return predictor;
  };
  out$.get_next_intervention_to_test_for_data = get_next_intervention_to_test_for_data = function(data_list, intervention_names){
    var predictor, arm;
    predictor = train_multi_armed_bandit_for_data(data_list, intervention_names);
    arm = predictor.predict();
    return arm.reward;
  };
  /**
   * Trains predictor for choosing which intervention to use given a goal using Thompson Sampling.
   * Each sample is the session length using an intervention.
   */
  out$.train_multi_armed_bandit_for_goal = train_multi_armed_bandit_for_goal = async function(goal_name, intervention_names){
    var goals, interventions, data_list, intervention_name, i$, ref$, len$, time;
    if (intervention_names == null) {
      intervention_names = (await intervention_utils.list_enabled_interventions_for_goal(goal_name));
    }
    goals = (await get_goals());
    interventions = (await get_seconds_spent_on_domain_for_each_session_per_intervention(goals[goal_name].domain));
    data_list = [];
    for (intervention_name in interventions) {
      for (i$ = 0, len$ = (ref$ = interventions[intervention_name]).length; i$ < len$; ++i$) {
        time = ref$[i$];
        data_list.push({
          intervention: intervention_name,
          reward: 1 - Math.tanh(time / 3600)
        });
      }
    }
    return train_multi_armed_bandit_for_data(data_list, intervention_names);
  };
  out$.get_next_intervention_to_test_for_goal = get_next_intervention_to_test_for_goal = async function(goal_name, intervention_names){
    var predictor, arm;
    predictor = (await train_multi_armed_bandit_for_goal(goal_name, intervention_names));
    arm = predictor.predict();
    return arm.reward;
  };
  intervention_utils = require('libs_backend/intervention_utils');
  intervention_manager = require('libs_backend/intervention_manager');
  goal_progress = require('libs_backend/goal_progress');
  out$.__get__ = __get__ = function(name){
    return eval(name);
  };
  out$.__set__ = __set__ = function(name, val){
    return eval(name + ' = val');
  };
  gexport_module('multi_armed_bandit_thompson', function(it){
    return eval(it);
  });
}).call(this);
