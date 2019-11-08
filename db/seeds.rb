# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

avg100_code = File.read(File.join(File.dirname(__FILE__), '/metrics/avg_100.js'))
dcg_code = File.read(File.join(File.dirname(__FILE__), '/metrics/dcg.js'))
ndcg_code = File.read(File.join(File.dirname(__FILE__), '/metrics/ndcg.js'))

DefaultScorer.create(
  scale:  (1..10).to_a,
  code:   avg100_code,
  name:         'Average 100',
  state:        'published',
  published_at: Time.new(2014, 01, 01),
  default:      true
)

DefaultScorer.create(
  scale:  (1..10).to_a,
  code:   dcg_code,
  name:         'DCG',
  state:        'published',
  published_at: Time.new(2014, 01, 02),
  default:      false
)

DefaultScorer.create(
  scale:  (1..10).to_a,
  code:   ndcg_code,
  name:         'NDCG',
  state:        'published',
  published_at: Time.new(2014, 01, 03),
  default:      false
)

if ENV['SEED_TEST']
  require_relative 'test_seeds'
end
